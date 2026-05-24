-- ─── Customers ────────────────────────────────────────────────────────────────
INSERT INTO customers (phone_number, full_name, email, address)
VALUES ('0901234567', 'Nguyen Minh Tuan', 'tuan.nm@gmail.com', '45 Tran Hung Dao, Q1, TP.HCM'),
       ('0912345670', 'Le Thi Hoa', 'hoa.lt@gmail.com', '12 Ly Thuong Kiet, Hoan Kiem, HN'),
       ('0923456780', 'Pham Quoc Dat', 'dat.pq@outlook.com', '78 Dinh Tien Hoang, Binh Thanh'),
       ('0934567890', 'Tran Thi Mai', 'mai.tt@yahoo.com', '23 Nguyen Van Cu, Q5, TP.HCM'),
       ('0945678901', 'Hoang Van Dung', 'dung.hv@gmail.com', '56 Ba Trieu, Hai Ba Trung, HN'),
       ('0956789012', 'Vo Thi Ngoc', 'ngoc.vt@gmail.com', '89 Le Van Sy, Q3, TP.HCM'),
       ('0967890123', 'Do Thanh Binh', 'binh.dt@gmail.com', '34 Phan Dinh Phung, Ba Dinh, HN'),
       ('0978901234', 'Bui Thi Lan', 'lan.bt@hotmail.com', '67 Nguyen Thi Minh Khai, Q1'),
       ('0989012345', 'Ngo Van Hai', 'hai.nv@gmail.com', '90 Hai Ba Trung, Q1, TP.HCM'),
       ('0990123456', 'Dinh Thi Thu', 'thu.dt@gmail.com',
        '15 Truong Chinh, Tan Binh, TP.HCM') ON CONFLICT (phone_number) DO
UPDATE
    SET full_name = EXCLUDED.full_name,
    updated_at = CURRENT_TIMESTAMP;

-- ─── Users SALES + STOCK ─────────────────────────────────────────────────────
INSERT INTO users (username, full_name, password, gender, phone_number, email, status, role_id, is_deleted,
                   is_password_reset)
VALUES ('nv.binhnt', 'Nguyen Thi Binh', '$2a$12$2H7sSIL9XV1aUV3qj87TIuUPgGwQTfnHuxFdAXYlWSXHxKyPgelB.', 0, '0912345678',
        'binh.nt@utc.vn', 'ACTIVE', (SELECT id FROM roles WHERE name = 'SALES'), 0, 0),
       ('nv.hungpv', 'Pham Van Hung', '$2a$12$2H7sSIL9XV1aUV3qj87TIuUPgGwQTfnHuxFdAXYlWSXHxKyPgelB.', 1, '0923456789',
        'hung.pv@utc.vn', 'ACTIVE', (SELECT id FROM roles WHERE name = 'SALES'), 0, 0),
       ('nv.thanhlt', 'Le Thi Thanh', '$2a$12$2H7sSIL9XV1aUV3qj87TIuUPgGwQTfnHuxFdAXYlWSXHxKyPgelB.', 0, '0934567891',
        'thanh.lt@utc.vn', 'ACTIVE', (SELECT id FROM roles WHERE name = 'STOCK'), 0, 0) ON CONFLICT (username) DO
UPDATE
    SET full_name = EXCLUDED.full_name,
    updated_at = CURRENT_TIMESTAMP;

-- ─── Product items ────────────────────────────────────────────────────────────
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
WITH ids AS (SELECT p.id pid, s.id sid, p.sku, s.name sname, p.price_import_std std_price
             FROM products p
                      JOIN suppliers s ON (p.sku, s.name) IN (
                                                              ('IPH-15PM-BLK', 'Apple Premium Reseller'),
                                                              ('SAM-S24U-256', 'Samsung Vietnam'),
                                                              ('XIA-14PRO-512', 'Digiworld Corporation'),
                                                              ('IPH-14-128', 'Apple Premium Reseller'),
                                                              ('MAC-AIR-M3-256', 'Apple Premium Reseller'),
                                                              ('DEL-XPS15-512', 'FPT Distribution'),
                                                              ('ASU-ZEN14-512', 'FPT Distribution'),
                                                              ('IPD-PRO13-256', 'Apple Premium Reseller'),
                                                              ('APD-PRO2-WHT', 'Apple Premium Reseller')
                 )),
     src AS (SELECT *
             FROM (VALUES ('IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001001', 20),
                          ('IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001002', 20),
                          ('IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001003', 15),
                          ('IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001004', 15),
                          ('IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001005', 10),
                          ('IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001006', 10),
                          ('IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001007', 5),
                          ('IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001008', 5),
                          ('SAM-S24U-256', 'Samsung Vietnam', '352046200002001', 25),
                          ('SAM-S24U-256', 'Samsung Vietnam', '352046200002002', 25),
                          ('SAM-S24U-256', 'Samsung Vietnam', '352046200002003', 18),
                          ('SAM-S24U-256', 'Samsung Vietnam', '352046200002004', 18),
                          ('SAM-S24U-256', 'Samsung Vietnam', '352046200002005', 7),
                          ('SAM-S24U-256', 'Samsung Vietnam', '352046200002006', 7),
                          ('XIA-14PRO-512', 'Digiworld Corporation', '860047300003001', 12),
                          ('XIA-14PRO-512', 'Digiworld Corporation', '860047300003002', 12),
                          ('XIA-14PRO-512', 'Digiworld Corporation', '860047300003003', 6),
                          ('XIA-14PRO-512', 'Digiworld Corporation', '860047300003004', 6),
                          ('XIA-14PRO-512', 'Digiworld Corporation', '860047300003005', 2),
                          ('XIA-14PRO-512', 'Digiworld Corporation', '860047300003006', 2),
                          ('IPH-14-128', 'Apple Premium Reseller', '358044900004001', 30),
                          ('IPH-14-128', 'Apple Premium Reseller', '358044900004002', 30),
                          ('IPH-14-128', 'Apple Premium Reseller', '358044900004003', 30),
                          ('MAC-AIR-M3-256', 'Apple Premium Reseller', 'C02ZM1YJMD6N001', 14),
                          ('MAC-AIR-M3-256', 'Apple Premium Reseller', 'C02ZM1YJMD6N002', 14),
                          ('MAC-AIR-M3-256', 'Apple Premium Reseller', 'C02ZM1YJMD6N003', 8),
                          ('MAC-AIR-M3-256', 'Apple Premium Reseller', 'C02ZM1YJMD6N004', 8),
                          ('MAC-AIR-M3-256', 'Apple Premium Reseller', 'C02ZM1YJMD6N005', 3),
                          ('DEL-XPS15-512', 'FPT Distribution', 'DXPS15FRGD50001', 22),
                          ('DEL-XPS15-512', 'FPT Distribution', 'DXPS15FRGD50002', 22),
                          ('DEL-XPS15-512', 'FPT Distribution', 'DXPS15FRGD50003', 10),
                          ('ASU-ZEN14-512', 'FPT Distribution', 'AZEN14H7L3M0001', 16),
                          ('ASU-ZEN14-512', 'FPT Distribution', 'AZEN14H7L3M0002', 16),
                          ('ASU-ZEN14-512', 'FPT Distribution', 'AZEN14H7L3M0003', 9),
                          ('IPD-PRO13-256', 'Apple Premium Reseller', 'DMPP5X3YQKL0001', 11),
                          ('IPD-PRO13-256', 'Apple Premium Reseller', 'DMPP5X3YQKL0002', 11),
                          ('IPD-PRO13-256', 'Apple Premium Reseller', 'DMPP5X3YQKL0003', 4),
                          ('IPD-PRO13-256', 'Apple Premium Reseller', 'DMPP5X3YQKL0004', 4),
                          ('APD-PRO2-WHT', 'Apple Premium Reseller', 'APD2GEN2USB0001', 18),
                          ('APD-PRO2-WHT', 'Apple Premium Reseller', 'APD2GEN2USB0002', 18),
                          ('APD-PRO2-WHT', 'Apple Premium Reseller', 'APD2GEN2USB0003',
                           8)) AS t(sku, sname, imei, days_ago))
SELECT i.pid,
       s.imei,
       i.std_price,
       i.sid,
       'AVAILABLE',
       CURRENT_TIMESTAMP - (s.days_ago || ' days')::INTERVAL  -- NUMTODSINTERVAL → INTERVAL
FROM src s
         JOIN ids i ON i.sku = s.sku AND i.sname = s.sname
WHERE NOT EXISTS (SELECT 1 FROM product_items pi WHERE pi.imei = s.imei);

-- ─── Orders ───────────────────────────────────────────────────────────────────
INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
SELECT u.id,
       c.id,
       src.amt,
       src.pay,
       src.sts,
       CURRENT_TIMESTAMP - (src.days_ago || ' days')::INTERVAL, CURRENT_TIMESTAMP - (src.days_ago || ' days') ::INTERVAL
FROM (VALUES ('0901234567', 29900000::NUMERIC, 'TRANSFER', 'COMPLETED', 7),
             ('0912345670', 26500000, 'CASH', 'COMPLETED', 6),
             ('0923456780', 57400000, 'TRANSFER', 'COMPLETED', 5),
             ('0934567890', 17200000, 'CASH', 'COMPLETED', 4),
             ('0945678901', 25500000, 'CARD', 'COMPLETED', 4),
             ('0956789012', 22500000, 'TRANSFER', 'COMPLETED', 3),
             ('0967890123', 9200000, 'CASH', 'COMPLETED', 2),
             ('0978901234', 18000000, 'TRANSFER', 'COMPLETED', 2),
             ('0989012345', 30500000, 'TRANSFER', 'CANCELED', 3),
             ('0990123456', 9200000, 'CASH', 'CANCELED', 1),
             ('0901234567', 26500000, 'CARD', 'PENDING', 1),
             ('0901234567', 29900000, 'TRANSFER', 'COMPLETED', 0),
             ('0912345670', 17200000, 'CASH', 'COMPLETED', 0),
             ('0923456780', 22500000, 'CARD', 'COMPLETED', 0),
             ('0945678901', 5800000, 'CASH', 'COMPLETED', 0),
             ('0934567890', 35800000, 'TRANSFER', 'PENDING', 0),
             ('0956789012', 30500000, 'TRANSFER', 'PENDING', 0)) AS src(ph, amt, pay, sts, days_ago)
         JOIN customers c ON c.phone_number = src.ph
         JOIN users u ON u.username = 'admin'
WHERE NOT EXISTS (SELECT 1
                  FROM orders o
                  WHERE o.customer_id = c.id
                    AND o.total_amount = src.amt
                    AND o.status = src.sts
                    AND o.payment_method = src.pay
                    -- Oracle TRUNC(timestamp) → PostgreSQL DATE_TRUNC hoặc cast ::DATE
                    AND o.created_at::DATE = (CURRENT_TIMESTAMP - (src.days_ago || ' days')::INTERVAL)::DATE);

-- ─── Order items ──────────────────────────────────────────────────────────────
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
WITH order_map AS (SELECT o.id             oid,
                          o.customer_id    cid,
                          o.total_amount   amt,
                          o.payment_method pay,
                          o.created_at::DATE odate
                   FROM orders o
                   WHERE o.status = 'COMPLETED'),
     src AS (SELECT *
             FROM (VALUES ('0901234567', 29900000::NUMERIC, 'TRANSFER', 7, 'IPH-15PM-BLK', 1, 29900000::NUMERIC),
                          ('0912345670', 26500000, 'CASH', 6, 'SAM-S24U-256', 1, 26500000),
                          ('0923456780', 57400000, 'TRANSFER', 5, 'IPH-15PM-BLK', 1, 29900000),
                          ('0923456780', 57400000, 'TRANSFER', 5, 'SAM-A55-256', 3, 9200000),
                          ('0934567890', 17200000, 'CASH', 4, 'XIA-14PRO-512', 1, 17200000),
                          ('0945678901', 25500000, 'CARD', 4, 'IPD-PRO13-256', 1, 25500000),
                          ('0956789012', 22500000, 'TRANSFER', 3, 'ASU-ZEN14-512', 1, 22500000),
                          ('0967890123', 9200000, 'CASH', 2, 'SAM-A55-256', 1, 9200000),
                          ('0978901234', 18000000, 'TRANSFER', 2, 'IPH-14-128', 1, 18000000),
                          ('0901234567', 29900000, 'TRANSFER', 0, 'IPH-15PM-BLK', 1, 29900000),
                          ('0912345670', 17200000, 'CASH', 0, 'XIA-14PRO-512', 1, 17200000),
                          ('0923456780', 22500000, 'CARD', 0, 'ASU-ZEN14-512', 1, 22500000),
                          ('0945678901', 5800000, 'CASH', 0, 'APD-PRO2-WHT', 1,
                           5800000)) AS t(cust_ph, total_amt, pay_method, days_ago, prod_sku, qty, unit_price))
SELECT om.oid, p.id, s.qty, s.unit_price
FROM src s
         JOIN customers c ON c.phone_number = s.cust_ph
         JOIN order_map om ON om.cid = c.id
    AND om.amt = s.total_amt
    AND om.pay = s.pay_method
    AND om.odate = (CURRENT_TIMESTAMP - (s.days_ago || ' days')::INTERVAL)::DATE
JOIN products  p
ON p.sku = s.prod_sku
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi
    WHERE oi.order_id = om.oid
  AND oi.product_id = p.id
    );

-- ─── Stock movements ──────────────────────────────────────────────────────────
INSERT INTO stock_movements (product_id, type, action_type, quantity, supplier_id, created_by, note, created_at,
                             updated_at)
SELECT p.id,
       v.mv_type,
       v.act_type,
       v.qty,
       s.id,
       1,
       v.note,
       CURRENT_TIMESTAMP - (v.days_ago || ' days')::INTERVAL, CURRENT_TIMESTAMP - (v.days_ago || ' days') ::INTERVAL
FROM (VALUES ('IPH-15PM-BLK', 'Apple Premium Reseller', 'IMPORT', 'PURCHASE', 10, 20,
              'Nhap lo iPhone 15 Pro Max dau tien'),
             ('SAM-S24U-256', 'Samsung Vietnam', 'IMPORT', 'PURCHASE', 15, 25,
              'Nhap Samsung Galaxy S24 Ultra tu Samsung Vietnam'),
             ('MAC-AIR-M3-256', 'Apple Premium Reseller', 'IMPORT', 'PURCHASE', 8, 14, 'Nhap MacBook Air M3 tu APR'),
             ('CAB-USBC-2M', 'FPT Distribution', 'IMPORT', 'PURCHASE', 50, 10, 'Nhap cap USB-C so luong lon'),
             ('IPH-15PM-BLK', NULL, 'EXPORT', 'SALE', 3, 7, 'Xuat ban iPhone 15 PM qua don hang'),
             ('SAM-A55-256', NULL, 'EXPORT', 'SALE', 3, 5,
              'Xuat ban Samsung A55 qua don hang')) AS v(sku, sup, mv_type, act_type, qty, days_ago, note)
         JOIN products p ON p.sku = v.sku
         LEFT JOIN suppliers s ON s.name = v.sup
WHERE NOT EXISTS (SELECT 1
                  FROM stock_movements sm
                  WHERE sm.product_id = p.id
                    AND sm.type = v.mv_type
                    AND sm.action_type = v.act_type
                    AND sm.created_at::DATE = (CURRENT_TIMESTAMP - (v.days_ago || ' days')::INTERVAL)::DATE);

-- ─── Warehouses ───────────────────────────────────────────────────────────────
DELETE
FROM inventory_details;
DELETE
FROM inventory_sessions;
UPDATE product_items
SET location_id = NULL;
DELETE
FROM warehouse_locations;
DELETE
FROM warehouses;

INSERT INTO warehouses (name, address)
VALUES ('Kho Trung Tam Ha Noi', '15 Pham Hung, Cau Giay, Ha Noi'),
       ('Kho Mien Bac Bac Ninh', 'KCN Yen Phong, Bac Ninh'),
       ('Kho Mien Nam HCM', '128 Truong Chinh, Tan Binh, TP.HCM');

-- ─── Warehouse locations (bin grid) ──────────────────────────────────────────
INSERT INTO warehouse_locations (warehouse_id, zone_name, row_num, shelf_num, bin_num)
-- Hanoi: zones A,B × rows 1,2 × shelves 1..3 × bins 1..5 = 60 bins
SELECT w.id, t.zone, t.row_val, shelf::TEXT, bin::TEXT
FROM warehouses w
         CROSS JOIN (VALUES ('A', '1'), ('A', '2'), ('B', '1'), ('B', '2')) AS t(zone, row_val)
         CROSS JOIN generate_series(1, 3) AS shelf
         CROSS JOIN generate_series(1, 5) AS bin
WHERE w.name = 'Kho Trung Tam Ha Noi'

UNION ALL

-- Bac Ninh: zone A × rows 1,2 × shelves 1..3 × bins 1..5 = 30 bins
SELECT w.id, t.zone, t.row_val, shelf::TEXT, bin::TEXT
FROM warehouses w
         CROSS JOIN (VALUES ('A', '1'), ('A', '2')) AS t(zone, row_val)
         CROSS JOIN generate_series(1, 3) AS shelf
         CROSS JOIN generate_series(1, 5) AS bin
WHERE w.name = 'Kho Mien Bac Bac Ninh'

UNION ALL

-- HCM: zones A,B × row 1 × shelves 1..3 × bins 1..5 = 30 bins
SELECT w.id, t.zone, '1', shelf::TEXT, bin::TEXT
FROM warehouses w
         CROSS JOIN (VALUES ('A'), ('B')) AS t(zone)
         CROSS JOIN generate_series(1, 3) AS shelf
         CROSS JOIN generate_series(1, 5) AS bin
WHERE w.name = 'Kho Mien Nam HCM';

-- ─── Backfill supplier_id ─────────────────────────────────────────────────────
UPDATE product_items
SET supplier_id = (SELECT id FROM suppliers WHERE name = 'Apple Premium Reseller')
WHERE supplier_id IS NULL
  AND (imei LIKE '358045%' OR imei LIKE '358044%' OR imei LIKE 'C02ZM%'
    OR imei LIKE 'DMPP5%' OR imei LIKE 'APD2%');

UPDATE product_items
SET supplier_id = (SELECT id FROM suppliers WHERE name = 'Samsung Vietnam')
WHERE supplier_id IS NULL
  AND imei LIKE '352046%';

UPDATE product_items
SET supplier_id = (SELECT id FROM suppliers WHERE name = 'Digiworld Corporation')
WHERE supplier_id IS NULL
  AND imei LIKE '860047%';

UPDATE product_items
SET supplier_id = (SELECT id FROM suppliers WHERE name = 'FPT Distribution')
WHERE supplier_id IS NULL
  AND (imei LIKE 'DXPS15%' OR imei LIKE 'AZEN14%');

UPDATE product_items
SET supplier_id = (SELECT id FROM suppliers WHERE name = 'FPT Distribution')
WHERE supplier_id IS NULL;

-- ─── Distribute product_items to bins (round-robin) ──────────────────────────
UPDATE product_items
SET location_id = src.loc_id FROM (
    SELECT pi.id AS item_id, wl.id AS loc_id
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
        FROM product_items WHERE location_id IS NULL
    ) pi
    JOIN (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
        FROM warehouse_locations
    ) wl ON wl.rn = pi.rn
) src
WHERE product_items.id = src.item_id;

-- ─── Mark subset as SOLD ─────────────────────────────────────────────────────
UPDATE product_items
SET status               = 'SOLD',
    order_id             = src.order_id,
    sold_date            = src.created_at,
    warranty_expiry_date = src.created_at + INTERVAL '365 days'
FROM (
    SELECT pi.id AS item_id, ord.order_id, ord.created_at
    FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM product_items WHERE status = 'AVAILABLE'
    ) pi
    JOIN (
    SELECT id AS order_id, created_at, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
    FROM orders WHERE status = 'COMPLETED'
    LIMIT 8
    ) ord ON ord.rn = pi.rn
    ) src
WHERE product_items.id = src.item_id;

-- ─── Mark 2 items DAMAGED ────────────────────────────────────────────────────
-- Oracle: WHERE ROWNUM <= 2 → PostgreSQL: LIMIT
UPDATE product_items
SET status = 'DAMAGED'
WHERE id IN (SELECT id
             FROM product_items
             WHERE status = 'AVAILABLE'
             ORDER BY id DESC
    LIMIT 2
    );

-- ─── Realign current_stock ────────────────────────────────────────────────────
UPDATE products
SET current_stock = c.cnt FROM (
    SELECT product_id, COUNT(*) AS cnt
    FROM product_items WHERE status = 'AVAILABLE'
    GROUP BY product_id
) c
WHERE products.id = c.product_id;

UPDATE products
SET current_stock = 0
WHERE id IN (SELECT p.id
             FROM products p
                      LEFT JOIN product_items pi ON pi.product_id = p.id AND pi.status = 'AVAILABLE'
             WHERE pi.id IS NULL);

-- ─── Restore current_stock for non-IMEI products (V8) ────────────────────────
UPDATE products
SET current_stock = CASE sku
                        WHEN 'CAB-USBC-2M' THEN 45
                        WHEN 'CHG-GAN65W' THEN 28
                        WHEN 'CAS-IPH15-CLR' THEN 32
                        WHEN 'MOU-LGT-MX3' THEN 12
                        WHEN 'SAM-A55-256' THEN 15
                        WHEN 'APD-PRO2-WHT' THEN 6
                        ELSE current_stock
    END
WHERE has_imei = 0
   OR sku IN ('SAM-A55-256', 'APD-PRO2-WHT');

-- ─── COMPLETED inventory session ─────────────────────────────────────────────
WITH ins_session AS (
INSERT
INTO inventory_sessions (warehouse_id, created_by, status, start_date, end_date)
SELECT w.id,
       u.id,
       'COMPLETED',
       CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '45 minutes'
FROM warehouses w, users u
WHERE w.name = 'Kho Trung Tam Ha Noi'
  AND u.username = 'admin'
    RETURNING id AS session_id
    )
    , available_items AS (
SELECT id, imei, location_id, ROW_NUMBER() OVER (ORDER BY id) AS rn
FROM product_items
WHERE location_id IS NOT NULL
  AND status = 'AVAILABLE'
    )
INSERT
INTO inventory_details (session_id, imei, expected_loc, actual_loc, record_status, note)
SELECT s.session_id, ai.imei, ai.location_id, ai.location_id, 'MATCH', NULL
FROM ins_session s
         CROSS JOIN available_items ai
WHERE ai.rn <= 5
UNION ALL
SELECT s.session_id,
       ai.imei,
       ai.location_id,
       (SELECT MIN(id) FROM warehouse_locations WHERE id <> ai.location_id),
       'MISMATCH',
       'Item duoc scan o bin khac voi vi tri ky vong'
FROM ins_session s
         CROSS JOIN available_items ai
WHERE ai.rn BETWEEN 6 AND 7
UNION ALL
SELECT s.session_id,
       ai.imei,
       ai.location_id,
       NULL,
       'MISSING',
       'Khong tim thay khi kiem ke'
FROM ins_session s
         CROSS JOIN available_items ai
WHERE ai.rn = 8
UNION ALL
SELECT s.session_id,
       'UNKNOWN_IMEI_99999',
       NULL,
       (SELECT MIN(id) FROM warehouse_locations),
       'EXTRA',
       'IMEI khong co trong he thong nhung phat hien tren ke'
FROM ins_session s;

-- ─── IN_PROGRESS inventory session ───────────────────────────────────────────
INSERT INTO inventory_sessions (warehouse_id, created_by, status, start_date)
SELECT (SELECT MIN(id) FROM warehouses),
       u.id,
       'IN_PROGRESS',
       CURRENT_TIMESTAMP - INTERVAL '20 minutes'
FROM users u
WHERE u.username = 'admin'
  AND NOT EXISTS (SELECT 1 FROM inventory_sessions WHERE status = 'IN_PROGRESS');

-- ─── Audit logs (DAY offset) ─────────────────────────────────────────────────
INSERT INTO audit_logs (user_id, username, action, entity_name, entity_id, status, details, created_at, updated_at)
SELECT 1,
       'SYSTEM',
       v.action,
       v.entity,
       v.eid,
       'SUCCESS',
       v.log_detail,
       CURRENT_TIMESTAMP - (v.days_ago || ' days')::INTERVAL, CURRENT_TIMESTAMP - (v.days_ago || ' days') ::INTERVAL
FROM (VALUES ('CREATE_PRODUCT', 'PRODUCT', '1', 'Admin tao san pham iPhone 15 Pro Max', 20),
             ('IMPORT_STOCK', 'PRODUCT', '1', 'Nhap kho 10 iPhone 15 PM - Apple Premium Reseller', 20),
             ('IMPORT_STOCK', 'PRODUCT', '6', 'Nhap kho 8 MacBook Air M3 - Apple Premium Reseller', 14),
             ('CREATE_ORDER', 'ORDER', '1', 'Tao don hang - KH: Nguyen Minh Tuan - 29,900,000', 7),
             ('CREATE_ORDER', 'ORDER', '5', 'Tao don hang - KH: Hoang Van Dung - MacBook Air M3', 4),
             ('CREATE_WAREHOUSE', 'WAREHOUSE', '1', 'Tao kho Trung Tam Ha Noi (60 bin)', 5),
             ('CREATE_WAREHOUSE', 'WAREHOUSE', '2', 'Tao kho Mien Bac Bac Ninh (30 bin)', 4),
             ('CREATE_WAREHOUSE', 'WAREHOUSE', '3', 'Tao kho Mien Nam HCM (30 bin)', 4),
             ('IMPORT_STOCK', 'PRODUCT', '4', 'Nhap kho 15 Samsung Galaxy A55 - Samsung Vietnam', 3),
             ('CREATE_USER', 'USER', '21', 'Tao tai khoan nhan vien Nguyen Thi Binh', 6),
             ('UPDATE_ROLE', 'USER', '22', 'Cap nhat vai tro Pham Van Hung -> SALES', 5),
             ('CREATE_CATEGORY', 'CATEGORY', '21', 'Tao danh muc Dien thoai di dong', 8),
             ('CREATE_SUPPLIER', 'SUPPLIER', '22', 'Them nha cung cap Samsung Vietnam', 8),
             ('MARK_DAMAGED', 'PRODUCT_ITEM', '40', 'Danh dau IMEI bi loi sau khi kiem ke', 2),
             ('RECEIVE_WARRANTY', 'WARRANTY', '1', 'Tiep nhan yeu cau bao hanh iPhone 15 PM',
              5)) AS v(action, entity, eid, log_detail, days_ago)
WHERE NOT EXISTS (SELECT 1
                  FROM audit_logs al
                  WHERE al.user_id = 1
                    AND al.username = 'SYSTEM'
                    AND al.action = v.action
                    AND al.entity_id = v.eid
                    AND al.details = v.log_detail
);

-- ─── Audit logs (HOUR offset) ────────────────────────────────────────────────
INSERT INTO audit_logs (user_id, username, action, entity_name, entity_id, status, details, created_at, updated_at)
SELECT 1,
       'SYSTEM',
       v.action,
       v.entity,
       v.eid,
       'SUCCESS',
       v.log_detail,
       CURRENT_TIMESTAMP - (v.hours_ago || ' hours')::INTERVAL, CURRENT_TIMESTAMP - (v.hours_ago || ' hours') ::INTERVAL
FROM (VALUES ('CREATE_ORDER', 'ORDER', '12', 'Tao don hang hom nay - iPhone 15 PM - 29,900,000', 1),
             ('CREATE_ORDER', 'ORDER', '13', 'Tao don hang hom nay - Xiaomi 14 Pro - 17,200,000', 2),
             ('IMPORT_STOCK', 'PRODUCT', '4', 'Nhap kho Samsung Galaxy A55 - 20 units',
              3)) AS v(action, entity, eid, log_detail, hours_ago)
WHERE NOT EXISTS (SELECT 1
                  FROM audit_logs al
                  WHERE al.user_id = 1
                    AND al.username = 'SYSTEM'
                    AND al.action = v.action
                    AND al.entity_id = v.eid
                    AND al.created_at >= CURRENT_TIMESTAMP - ((v.hours_ago + 1) || ' hours')::INTERVAL
    AND al.created_at < CURRENT_TIMESTAMP - ((v.hours_ago - 1) || ' hours')::INTERVAL);

-- ─── Warranty claims ──────────────────────────────────────────────────────────)
INSERT INTO warranty_claims (product_item_id, customer_id, created_by, issue_description, status, received_date,
                             return_date)
SELECT pi.id,
       c.id,
       1,
       v.issue,
       v.sts,
       CURRENT_TIMESTAMP - (v.recv_days || ' days')::INTERVAL, CASE
                                                                   WHEN v.ret_days IS NOT NULL
                                                                       THEN CURRENT_TIMESTAMP - (v.ret_days || ' days')::INTERVAL
END
FROM (VALUES
    ('358045100001001', '0901234567', 'Man hinh iPhone 15 PM bi soc doc sau 3 thang',          'FIXING',   5, NULL::INTEGER),
    ('352046200002001', '0912345670', 'Samsung S24 Ultra khong nhan sac nhanh, pin hao nhanh', 'RECEIVED', 2, NULL),
    ('C02ZM1YJMD6N001', '0934567890', 'MacBook Air M3 ban phim bi liet 2 phim sau 1 thang',    'FIXED',    10, 3)
) AS v(imei, ph, issue, sts, recv_days, ret_days)
JOIN product_items pi ON pi.imei        = v.imei
JOIN customers     c  ON c.phone_number = v.ph
WHERE NOT EXISTS (
    SELECT 1 FROM warranty_claims wc
    WHERE wc.product_item_id = pi.id
      AND wc.customer_id     = c.id
);