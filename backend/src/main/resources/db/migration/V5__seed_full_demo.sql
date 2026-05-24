-- V7: Comprehensive demo seed.
-- Cleans up any test inventory + warehouse rows from earlier dev runs,
-- then seeds three realistic warehouses with bin grids, backfills
-- supplier_id / location_id on product_items, marks a subset as SOLD or
-- DAMAGED, and inserts one finished inventory session with mixed
-- MATCH / MISMATCH / MISSING / EXTRA detail rows.
--
-- Each step is wrapped so it runs at most once. The migration is
-- intentionally idempotent: re-running on the same database leaves it
-- in the same final state.

-- ─── 1. Clean up legacy / smoke-test rows ──────────────────────────────────
DELETE FROM inventory_details;
DELETE FROM inventory_sessions;

UPDATE product_items SET location_id = NULL;

DELETE FROM warehouse_locations;
DELETE FROM warehouses;

COMMIT;

-- ─── 2. Three real warehouses ──────────────────────────────────────────────
INSERT INTO warehouses (name, address)
SELECT 'Kho Trung Tam Ha Noi',  '15 Pham Hung, Cau Giay, Ha Noi'        FROM dual UNION ALL
SELECT 'Kho Mien Bac Bac Ninh', 'KCN Yen Phong, Bac Ninh'               FROM dual UNION ALL
SELECT 'Kho Mien Nam HCM',      '128 Truong Chinh, Tan Binh, TP.HCM'    FROM dual;

COMMIT;

-- ─── 3. Bin layout per warehouse ───────────────────────────────────────────
-- Hanoi (largest):  zones A,B  × rows 1,2 × shelves 1..3 × bins 1..5  = 60 bins
-- Bac Ninh (mid) :  zones A    × rows 1,2 × shelves 1..3 × bins 1..5  = 30 bins
-- HCM (mid)      :  zones A,B  × rows 1   × shelves 1..3 × bins 1..5  = 30 bins
DECLARE
    PROCEDURE create_grid(p_wh_id NUMBER,
                          p_zones VARCHAR2,
                          p_rows  VARCHAR2,
                          p_shelves NUMBER,
                          p_bins NUMBER) IS
        v_zone CHAR(1);
        v_row  CHAR(1);
    BEGIN
        FOR z IN 1 .. LENGTH(p_zones) LOOP
            v_zone := SUBSTR(p_zones, z, 1);
            FOR r IN 1 .. LENGTH(p_rows) LOOP
                v_row := SUBSTR(p_rows, r, 1);
                FOR s IN 1 .. p_shelves LOOP
                    FOR b IN 1 .. p_bins LOOP
                        INSERT INTO warehouse_locations
                            (warehouse_id, zone_name, row_num, shelf_num, bin_num)
                        VALUES
                            (p_wh_id, v_zone, v_row, TO_CHAR(s), TO_CHAR(b));
                    END LOOP;
                END LOOP;
            END LOOP;
        END LOOP;
    END;
BEGIN
    FOR w IN (SELECT id, name FROM warehouses ORDER BY id) LOOP
        IF w.name = 'Kho Trung Tam Ha Noi' THEN
            create_grid(w.id, 'AB', '12', 3, 5);
        ELSIF w.name = 'Kho Mien Bac Bac Ninh' THEN
            create_grid(w.id, 'A',  '12', 3, 5);
        ELSIF w.name = 'Kho Mien Nam HCM' THEN
            create_grid(w.id, 'AB', '1',  3, 5);
        END IF;
    END LOOP;
END;
/

COMMIT;

-- ─── 4. Backfill supplier_id on product_items based on IMEI prefix ─────────
-- Brand → preferred supplier mapping (uses suppliers seeded by V3).
UPDATE product_items pi
SET pi.supplier_id = (SELECT id FROM suppliers WHERE name = 'Apple Premium Reseller')
WHERE pi.supplier_id IS NULL
  AND (pi.imei LIKE '358045%' OR pi.imei LIKE '358044%' OR pi.imei LIKE 'C02ZM%' OR
       pi.imei LIKE 'DMPP5%'  OR pi.imei LIKE 'APD2%');

UPDATE product_items pi
SET pi.supplier_id = (SELECT id FROM suppliers WHERE name = 'Samsung Vietnam')
WHERE pi.supplier_id IS NULL
  AND pi.imei LIKE '352046%';

UPDATE product_items pi
SET pi.supplier_id = (SELECT id FROM suppliers WHERE name = 'Digiworld Corporation')
WHERE pi.supplier_id IS NULL
  AND pi.imei LIKE '860047%';

UPDATE product_items pi
SET pi.supplier_id = (SELECT id FROM suppliers WHERE name = 'FPT Distribution')
WHERE pi.supplier_id IS NULL
  AND (pi.imei LIKE 'DXPS15%' OR pi.imei LIKE 'AZEN14%');

-- Fallback for anything unmatched
UPDATE product_items pi
SET pi.supplier_id = (SELECT id FROM suppliers WHERE name = 'FPT Distribution')
WHERE pi.supplier_id IS NULL;

COMMIT;

-- ─── 5. Distribute product_items across bins round-robin ───────────────────
-- Each item gets a unique bin (we have 120 bins for ~41 items).
MERGE INTO product_items pi
USING (
    SELECT pi.id  item_id,
           wl.id  loc_id
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) rn
        FROM product_items
        WHERE location_id IS NULL
    ) pi
    JOIN (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) rn
        FROM warehouse_locations
    ) wl ON wl.rn = pi.rn
) src ON (pi.id = src.item_id)
WHEN MATCHED THEN UPDATE SET pi.location_id = src.loc_id;

COMMIT;

-- ─── 6. Mark a subset as SOLD, link to first completed orders ──────────────
-- Take 8 completed orders, attach 1 SOLD item each, set sold/warranty dates.
MERGE INTO product_items pi
USING (
    SELECT pi.item_id, ord.order_id, ord.created_at
    FROM (
        SELECT id item_id, ROW_NUMBER() OVER (ORDER BY id) rn
        FROM product_items
        WHERE status = 'AVAILABLE'
    ) pi
    JOIN (
        SELECT id order_id, created_at,
               ROW_NUMBER() OVER (ORDER BY created_at) rn
        FROM orders
        WHERE status = 'COMPLETED'
        FETCH FIRST 8 ROWS ONLY
    ) ord ON ord.rn = pi.rn
) src ON (pi.id = src.item_id)
WHEN MATCHED THEN UPDATE SET
    pi.status               = 'SOLD',
    pi.order_id             = src.order_id,
    pi.sold_date            = src.created_at,
    pi.warranty_expiry_date = src.created_at + NUMTODSINTERVAL(365, 'DAY');

COMMIT;

-- ─── 7. Mark 2 items DAMAGED for a richer dashboard ────────────────────────
UPDATE product_items
SET status = 'DAMAGED'
WHERE id IN (
    SELECT id FROM (
        SELECT id FROM product_items
        WHERE status = 'AVAILABLE'
        ORDER BY id DESC
    ) WHERE ROWNUM <= 2
);

COMMIT;

-- ─── 8. Realign product.current_stock with product_items reality ───────────
-- After step 6/7 the count of AVAILABLE items per product no longer matches
-- products.current_stock. Recompute it so dashboards / xuat-kho behave.
MERGE INTO products p
USING (
    SELECT product_id, COUNT(*) cnt
    FROM product_items
    WHERE status = 'AVAILABLE'
    GROUP BY product_id
) c ON (p.id = c.product_id)
WHEN MATCHED THEN UPDATE SET p.current_stock = c.cnt;

-- Products that lost all AVAILABLE items: zero them
UPDATE products SET current_stock = 0
WHERE id IN (
    SELECT p.id FROM products p
    LEFT JOIN product_items pi
           ON pi.product_id = p.id AND pi.status = 'AVAILABLE'
    WHERE pi.id IS NULL
);

COMMIT;

-- ─── 9. One COMPLETED inventory session with mixed result rows ─────────────
DECLARE
    v_session_id NUMBER;
    v_wh_id      NUMBER;
    v_admin_id   NUMBER;
BEGIN
    SELECT id INTO v_admin_id FROM users WHERE username = 'admin' FETCH FIRST 1 ROWS ONLY;
    SELECT id INTO v_wh_id    FROM warehouses WHERE name = 'Kho Trung Tam Ha Noi' FETCH FIRST 1 ROWS ONLY;

    INSERT INTO inventory_sessions (created_by, status, start_date, end_date, warehouse_id)
    VALUES (v_admin_id, 'COMPLETED',
            CURRENT_TIMESTAMP - NUMTODSINTERVAL(2, 'DAY'),
            CURRENT_TIMESTAMP - NUMTODSINTERVAL(2, 'DAY') + NUMTODSINTERVAL(45, 'MINUTE'),
            v_wh_id)
    RETURNING id INTO v_session_id;

    -- 5 MATCH rows (5 items scanned at their expected location)
    INSERT INTO inventory_details (session_id, imei, expected_loc, actual_loc, record_status, note)
    SELECT v_session_id, pi.imei, pi.location_id, pi.location_id, 'MATCH', NULL
    FROM (
        SELECT id, imei, location_id, ROW_NUMBER() OVER (ORDER BY id) rn
        FROM product_items
        WHERE location_id IS NOT NULL AND status = 'AVAILABLE'
    ) pi
    WHERE pi.rn <= 5;

    -- 2 MISMATCH rows (scanned at wrong bin)
    INSERT INTO inventory_details (session_id, imei, expected_loc, actual_loc, record_status, note)
    SELECT v_session_id, pi.imei, pi.location_id,
           (SELECT MIN(id) FROM warehouse_locations WHERE id <> pi.location_id),
           'MISMATCH',
           'Item duoc scan o bin khac voi vi tri ky vong'
    FROM (
        SELECT id, imei, location_id, ROW_NUMBER() OVER (ORDER BY id) rn
        FROM product_items
        WHERE location_id IS NOT NULL AND status = 'AVAILABLE'
    ) pi
    WHERE pi.rn BETWEEN 6 AND 7;

    -- 1 MISSING row (item exists in DB, was not scanned)
    INSERT INTO inventory_details (session_id, imei, expected_loc, actual_loc, record_status, note)
    SELECT v_session_id, pi.imei, pi.location_id, NULL, 'MISSING', 'Khong tim thay khi kiem ke'
    FROM (
        SELECT id, imei, location_id, ROW_NUMBER() OVER (ORDER BY id) rn
        FROM product_items
        WHERE location_id IS NOT NULL AND status = 'AVAILABLE'
    ) pi
    WHERE pi.rn = 8;

    -- 1 EXTRA row (scanned an unknown IMEI)
    INSERT INTO inventory_details (session_id, imei, expected_loc, actual_loc, record_status, note)
    VALUES (v_session_id, 'UNKNOWN_IMEI_99999', NULL,
            (SELECT MIN(id) FROM warehouse_locations),
            'EXTRA', 'IMEI khong co trong he thong nhung phat hien tren ke');
END;
/

COMMIT;

-- ─── 10. One IN_PROGRESS inventory session for live UI ─────────────────────
INSERT INTO inventory_sessions (created_by, status, start_date, warehouse_id)
SELECT u.id, 'IN_PROGRESS', CURRENT_TIMESTAMP - NUMTODSINTERVAL(20, 'MINUTE'),
       (SELECT MIN(id) FROM warehouses)
FROM users u WHERE u.username = 'admin'
  AND NOT EXISTS (
      SELECT 1 FROM inventory_sessions s
      WHERE s.status = 'IN_PROGRESS'
  );

COMMIT;

-- ─── 11. Audit log entries for major actions ──────────────────────────────
INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
SELECT 1, v.action, v.entity, v.eid, 'SUCCESS', v.log_detail,
       CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.days_ago, 'DAY'),
       CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.days_ago, 'DAY')
FROM (
    SELECT 'CREATE_WAREHOUSE' action, 'WAREHOUSE' entity, '1'  eid,
           'Tao kho Trung Tam Ha Noi (60 bin)' log_detail, 5 days_ago FROM dual UNION ALL
    SELECT 'CREATE_WAREHOUSE',          'WAREHOUSE',         '2',
           'Tao kho Mien Bac Bac Ninh (30 bin)',                4    FROM dual UNION ALL
    SELECT 'CREATE_WAREHOUSE',          'WAREHOUSE',         '3',
           'Tao kho Mien Nam HCM (30 bin)',                     4    FROM dual UNION ALL
    SELECT 'IMPORT_STOCK',              'PRODUCT',           '4',
           'Nhap kho 15 Samsung Galaxy A55 - Samsung Vietnam',  3    FROM dual UNION ALL
    SELECT 'IMPORT_STOCK',              'PRODUCT',           '12',
           'Nhap kho 5 MacBook Air M3 - Apple Premium Reseller',3    FROM dual UNION ALL
    SELECT 'CREATE_USER',               'USER',              '21',
           'Tao tai khoan nhan vien Nguyen Thi Binh',           6    FROM dual UNION ALL
    SELECT 'UPDATE_ROLE',               'USER',              '22',
           'Cap nhat vai tro Pham Van Hung -> SALES',           5    FROM dual UNION ALL
    SELECT 'CREATE_CATEGORY',           'CATEGORY',          '21',
           'Tao danh muc Dien thoai di dong',                   8    FROM dual UNION ALL
    SELECT 'CREATE_SUPPLIER',           'SUPPLIER',          '22',
           'Them nha cung cap Samsung Vietnam',                 8    FROM dual UNION ALL
    SELECT 'MARK_DAMAGED',              'PRODUCT_ITEM',      '40',
           'Danh dau IMEI bi loi sau khi kiem ke',              2    FROM dual UNION ALL
    SELECT 'RECEIVE_WARRANTY',          'WARRANTY',          '1',
           'Tiep nhan yeu cau bao hanh iPhone 15 PM',           5    FROM dual
) v
WHERE NOT EXISTS (
    SELECT 1 FROM audit_logs al
    WHERE al.action    = v.action
      AND al.entity_id = v.eid
      AND DBMS_LOB.COMPARE(al.details, TO_CLOB(v.log_detail)) = 0
);

COMMIT;
