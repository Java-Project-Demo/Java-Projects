-- ── Customers ────────────────────────────────────────────────
MERGE INTO customers t
    USING (
        SELECT '0901234567' ph, 'Nguyen Minh Tuan' fn, 'tuan.nm@gmail.com'   em, '45 Tran Hung Dao, Q1, TP.HCM'      addr FROM dual UNION ALL
        SELECT '0912345670',    'Le Thi Hoa',           'hoa.lt@gmail.com',   '12 Ly Thuong Kiet, Hoan Kiem, HN'           FROM dual UNION ALL
        SELECT '0923456780',    'Pham Quoc Dat',         'dat.pq@outlook.com', '78 Dinh Tien Hoang, Binh Thanh'             FROM dual UNION ALL
        SELECT '0934567890',    'Tran Thi Mai',          'mai.tt@yahoo.com',   '23 Nguyen Van Cu, Q5, TP.HCM'               FROM dual UNION ALL
        SELECT '0945678901',    'Hoang Van Dung',        'dung.hv@gmail.com',  '56 Ba Trieu, Hai Ba Trung, HN'              FROM dual UNION ALL
        SELECT '0956789012',    'Vo Thi Ngoc',           'ngoc.vt@gmail.com',  '89 Le Van Sy, Q3, TP.HCM'                  FROM dual UNION ALL
        SELECT '0967890123',    'Do Thanh Binh',         'binh.dt@gmail.com',  '34 Phan Dinh Phung, Ba Dinh, HN'           FROM dual UNION ALL
        SELECT '0978901234',    'Bui Thi Lan',           'lan.bt@hotmail.com', '67 Nguyen Thi Minh Khai, Q1'               FROM dual UNION ALL
        SELECT '0989012345',    'Ngo Van Hai',           'hai.nv@gmail.com',   '90 Hai Ba Trung, Q1, TP.HCM'               FROM dual UNION ALL
        SELECT '0990123456',    'Dinh Thi Thu',          'thu.dt@gmail.com',   '15 Truong Chinh, Tan Binh, TP.HCM'         FROM dual
    ) s ON (t.phone_number = s.ph)
    WHEN MATCHED     THEN UPDATE SET t.full_name = s.fn, t.updated_at = CURRENT_TIMESTAMP
    WHEN NOT MATCHED THEN INSERT (phone_number, full_name, email, address)
        VALUES (s.ph, s.fn, s.em, s.addr);

-- ── Users SALES + STOCK ──────────────────────────────────────
MERGE INTO users t
    USING (
        SELECT 'nv.binhnt' uname, 'Nguyen Thi Binh' fn, 0 gdr, '0912345678' ph, 'binh.nt@utc.vn'  em, r.id role_id FROM roles r WHERE r.name = 'SALES' UNION ALL
        SELECT 'nv.hungpv',       'Pham Van Hung',   1,    '0923456789',    'hung.pv@utc.vn',       r.id             FROM roles r WHERE r.name = 'SALES' UNION ALL
        SELECT 'nv.thanhlt',      'Le Thi Thanh',    0,    '0934567891',    'thanh.lt@utc.vn',      r.id             FROM roles r WHERE r.name = 'STOCK'
    ) s ON (t.username = s.uname)
    WHEN MATCHED     THEN UPDATE SET t.full_name = s.fn, t.updated_at = CURRENT_TIMESTAMP
    WHEN NOT MATCHED THEN INSERT
        (username, full_name, password, gender, phone_number, email, status, role_id, is_deleted, is_password_reset)
        VALUES (s.uname, s.fn,
                '$2a$12$2H7sSIL9XV1aUV3qj87TIuUPgGwQTfnHuxFdAXYlWSXHxKyPgelB.',
                s.gdr, s.ph, s.em, 'ACTIVE', s.role_id, 0, 0);

-- ── Product items ────────────────────────────────────────────
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
WITH ids AS (
    SELECT p.id pid, s.id sid, p.sku, s.name sname, p.price_import_std std_price
    FROM products p JOIN suppliers s ON 1=1
    WHERE (p.sku, s.name) IN (
                              ('IPH-15PM-BLK',  'Apple Premium Reseller'),
                              ('SAM-S24U-256',  'Samsung Vietnam'),
                              ('XIA-14PRO-512', 'Digiworld Corporation'),
                              ('IPH-14-128',    'Apple Premium Reseller'),
                              ('MAC-AIR-M3-256','Apple Premium Reseller'),
                              ('DEL-XPS15-512', 'FPT Distribution'),
                              ('ASU-ZEN14-512', 'FPT Distribution'),
                              ('IPD-PRO13-256', 'Apple Premium Reseller'),
                              ('APD-PRO2-WHT',  'Apple Premium Reseller')
        )
),
     src (sku, sname, imei, days_ago) AS (
         SELECT 'IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001001', 20 FROM dual UNION ALL
         SELECT 'IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001002', 20 FROM dual UNION ALL
         SELECT 'IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001003', 15 FROM dual UNION ALL
         SELECT 'IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001004', 15 FROM dual UNION ALL
         SELECT 'IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001005', 10 FROM dual UNION ALL
         SELECT 'IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001006', 10 FROM dual UNION ALL
         SELECT 'IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001007',  5 FROM dual UNION ALL
         SELECT 'IPH-15PM-BLK', 'Apple Premium Reseller', '358045100001008',  5 FROM dual UNION ALL
         SELECT 'SAM-S24U-256', 'Samsung Vietnam',         '352046200002001', 25 FROM dual UNION ALL
         SELECT 'SAM-S24U-256', 'Samsung Vietnam',         '352046200002002', 25 FROM dual UNION ALL
         SELECT 'SAM-S24U-256', 'Samsung Vietnam',         '352046200002003', 18 FROM dual UNION ALL
         SELECT 'SAM-S24U-256', 'Samsung Vietnam',         '352046200002004', 18 FROM dual UNION ALL
         SELECT 'SAM-S24U-256', 'Samsung Vietnam',         '352046200002005',  7 FROM dual UNION ALL
         SELECT 'SAM-S24U-256', 'Samsung Vietnam',         '352046200002006',  7 FROM dual UNION ALL
         SELECT 'XIA-14PRO-512','Digiworld Corporation',   '860047300003001', 12 FROM dual UNION ALL
         SELECT 'XIA-14PRO-512','Digiworld Corporation',   '860047300003002', 12 FROM dual UNION ALL
         SELECT 'XIA-14PRO-512','Digiworld Corporation',   '860047300003003',  6 FROM dual UNION ALL
         SELECT 'XIA-14PRO-512','Digiworld Corporation',   '860047300003004',  6 FROM dual UNION ALL
         SELECT 'XIA-14PRO-512','Digiworld Corporation',   '860047300003005',  2 FROM dual UNION ALL
         SELECT 'XIA-14PRO-512','Digiworld Corporation',   '860047300003006',  2 FROM dual UNION ALL
         SELECT 'IPH-14-128',   'Apple Premium Reseller',  '358044900004001', 30 FROM dual UNION ALL
         SELECT 'IPH-14-128',   'Apple Premium Reseller',  '358044900004002', 30 FROM dual UNION ALL
         SELECT 'IPH-14-128',   'Apple Premium Reseller',  '358044900004003', 30 FROM dual UNION ALL
         SELECT 'MAC-AIR-M3-256','Apple Premium Reseller', 'C02ZM1YJMD6N001', 14 FROM dual UNION ALL
         SELECT 'MAC-AIR-M3-256','Apple Premium Reseller', 'C02ZM1YJMD6N002', 14 FROM dual UNION ALL
         SELECT 'MAC-AIR-M3-256','Apple Premium Reseller', 'C02ZM1YJMD6N003',  8 FROM dual UNION ALL
         SELECT 'MAC-AIR-M3-256','Apple Premium Reseller', 'C02ZM1YJMD6N004',  8 FROM dual UNION ALL
         SELECT 'MAC-AIR-M3-256','Apple Premium Reseller', 'C02ZM1YJMD6N005',  3 FROM dual UNION ALL
         SELECT 'DEL-XPS15-512', 'FPT Distribution',       'DXPS15FRGD50001', 22 FROM dual UNION ALL
         SELECT 'DEL-XPS15-512', 'FPT Distribution',       'DXPS15FRGD50002', 22 FROM dual UNION ALL
         SELECT 'DEL-XPS15-512', 'FPT Distribution',       'DXPS15FRGD50003', 10 FROM dual UNION ALL
         SELECT 'ASU-ZEN14-512', 'FPT Distribution',       'AZEN14H7L3M0001', 16 FROM dual UNION ALL
         SELECT 'ASU-ZEN14-512', 'FPT Distribution',       'AZEN14H7L3M0002', 16 FROM dual UNION ALL
         SELECT 'ASU-ZEN14-512', 'FPT Distribution',       'AZEN14H7L3M0003',  9 FROM dual UNION ALL
         SELECT 'IPD-PRO13-256', 'Apple Premium Reseller', 'DMPP5X3YQKL0001', 11 FROM dual UNION ALL
         SELECT 'IPD-PRO13-256', 'Apple Premium Reseller', 'DMPP5X3YQKL0002', 11 FROM dual UNION ALL
         SELECT 'IPD-PRO13-256', 'Apple Premium Reseller', 'DMPP5X3YQKL0003',  4 FROM dual UNION ALL
         SELECT 'IPD-PRO13-256', 'Apple Premium Reseller', 'DMPP5X3YQKL0004',  4 FROM dual UNION ALL
         SELECT 'APD-PRO2-WHT',  'Apple Premium Reseller', 'APD2GEN2USB0001', 18 FROM dual UNION ALL
         SELECT 'APD-PRO2-WHT',  'Apple Premium Reseller', 'APD2GEN2USB0002', 18 FROM dual UNION ALL
         SELECT 'APD-PRO2-WHT',  'Apple Premium Reseller', 'APD2GEN2USB0003',  8 FROM dual
     )
SELECT i.pid, s.imei, i.std_price, i.sid, 'AVAILABLE',
       CURRENT_TIMESTAMP - NUMTODSINTERVAL(s.days_ago, 'DAY')
FROM src s JOIN ids i ON i.sku = s.sku AND i.sname = s.sname
WHERE NOT EXISTS (SELECT 1 FROM product_items pi WHERE pi.imei = s.imei);

-- ── Orders ───────────────────────────────────────────────────
INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
SELECT u.id, c.id, src.amt, src.pay, src.sts,
       CURRENT_TIMESTAMP - NUMTODSINTERVAL(src.days_ago, 'DAY'),
       CURRENT_TIMESTAMP - NUMTODSINTERVAL(src.days_ago, 'DAY')
FROM (
         SELECT '0901234567' ph, 29900000 amt, 'TRANSFER' pay, 'COMPLETED' sts, 7 days_ago FROM dual UNION ALL
         SELECT '0912345670',    26500000,     'CASH',        'COMPLETED',      6           FROM dual UNION ALL
         SELECT '0923456780',    57400000,     'TRANSFER',    'COMPLETED',      5           FROM dual UNION ALL
         SELECT '0934567890',    17200000,     'CASH',        'COMPLETED',      4           FROM dual UNION ALL
         SELECT '0945678901',    25500000,     'CARD',        'COMPLETED',      4           FROM dual UNION ALL
         SELECT '0956789012',    22500000,     'TRANSFER',    'COMPLETED',      3           FROM dual UNION ALL
         SELECT '0967890123',     9200000,     'CASH',        'COMPLETED',      2           FROM dual UNION ALL
         SELECT '0978901234',    18000000,     'TRANSFER',    'COMPLETED',      2           FROM dual UNION ALL
         SELECT '0989012345',    30500000,     'TRANSFER',    'CANCELED',       3           FROM dual UNION ALL
         SELECT '0990123456',     9200000,     'CASH',        'CANCELED',       1           FROM dual UNION ALL
         SELECT '0901234567',    26500000,     'CARD',        'PENDING',        1           FROM dual UNION ALL
         SELECT '0901234567',    29900000,     'TRANSFER',    'COMPLETED',      0           FROM dual UNION ALL
         SELECT '0912345670',    17200000,     'CASH',        'COMPLETED',      0           FROM dual UNION ALL
         SELECT '0923456780',    22500000,     'CARD',        'COMPLETED',      0           FROM dual UNION ALL
         SELECT '0945678901',     5800000,     'CASH',        'COMPLETED',      0           FROM dual UNION ALL
         SELECT '0934567890',    35800000,     'TRANSFER',    'PENDING',        0           FROM dual UNION ALL
         SELECT '0956789012',    30500000,     'TRANSFER',    'PENDING',        0           FROM dual
     ) src
         JOIN customers c ON c.phone_number = src.ph
         JOIN users     u ON u.username     = 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id    = c.id
      AND o.total_amount   = src.amt
      AND o.status         = src.sts
      AND o.payment_method = src.pay
      AND TRUNC(o.created_at) = TRUNC(CURRENT_TIMESTAMP - NUMTODSINTERVAL(src.days_ago, 'DAY'))
);

-- ── Order items ──────────────────────────────────────────────
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
WITH order_map AS (
    SELECT o.id oid, o.customer_id cid, o.total_amount amt,
           o.payment_method pay, TRUNC(o.created_at) odate
    FROM orders o
    WHERE o.status = 'COMPLETED'
),
     src (cust_ph, total_amt, pay_method, days_ago, prod_sku, qty, unit_price) AS (
         SELECT '0901234567', 29900000, 'TRANSFER', 7, 'IPH-15PM-BLK',  1, 29900000 FROM dual UNION ALL
         SELECT '0912345670', 26500000, 'CASH',     6, 'SAM-S24U-256',  1, 26500000 FROM dual UNION ALL
         SELECT '0923456780', 57400000, 'TRANSFER', 5, 'IPH-15PM-BLK',  1, 29900000 FROM dual UNION ALL
         SELECT '0923456780', 57400000, 'TRANSFER', 5, 'SAM-A55-256',   3,  9200000 FROM dual UNION ALL
         SELECT '0934567890', 17200000, 'CASH',     4, 'XIA-14PRO-512', 1, 17200000 FROM dual UNION ALL
         SELECT '0945678901', 25500000, 'CARD',     4, 'IPD-PRO13-256', 1, 25500000 FROM dual UNION ALL
         SELECT '0956789012', 22500000, 'TRANSFER', 3, 'ASU-ZEN14-512', 1, 22500000 FROM dual UNION ALL
         SELECT '0967890123',  9200000, 'CASH',     2, 'SAM-A55-256',   1,  9200000 FROM dual UNION ALL
         SELECT '0978901234', 18000000, 'TRANSFER', 2, 'IPH-14-128',    1, 18000000 FROM dual UNION ALL
         SELECT '0901234567', 29900000, 'TRANSFER', 0, 'IPH-15PM-BLK',  1, 29900000 FROM dual UNION ALL
         SELECT '0912345670', 17200000, 'CASH',     0, 'XIA-14PRO-512', 1, 17200000 FROM dual UNION ALL
         SELECT '0923456780', 22500000, 'CARD',     0, 'ASU-ZEN14-512', 1, 22500000 FROM dual UNION ALL
         SELECT '0945678901',  5800000, 'CASH',     0, 'APD-PRO2-WHT',  1,  5800000 FROM dual
     )
SELECT om.oid, p.id, s.qty, s.unit_price
FROM src s
         JOIN customers c  ON c.phone_number = s.cust_ph
         JOIN order_map om ON om.cid   = c.id
    AND om.amt   = s.total_amt
    AND om.pay   = s.pay_method
    AND om.odate = TRUNC(CURRENT_TIMESTAMP - NUMTODSINTERVAL(s.days_ago, 'DAY'))
         JOIN products  p  ON p.sku    = s.prod_sku
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi
    WHERE oi.order_id   = om.oid
      AND oi.product_id = p.id
);

-- ── Stock movements ──────────────────────────────────────────
INSERT INTO stock_movements (product_id, type, action_type, quantity, supplier_id, created_by, note, created_at, updated_at)
SELECT p.id, v.mv_type, v.act_type, v.qty, s.id, 1, v.note,
       CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.days_ago, 'DAY'),
       CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.days_ago, 'DAY')
FROM (
         SELECT 'IPH-15PM-BLK'  sku, 'Apple Premium Reseller' sup, 'IMPORT' mv_type, 'PURCHASE' act_type, 10 qty, 20 days_ago, 'Nhap lo iPhone 15 Pro Max dau tien'         note FROM dual UNION ALL
         SELECT 'SAM-S24U-256',      'Samsung Vietnam',            'IMPORT', 'PURCHASE', 15, 25, 'Nhap Samsung Galaxy S24 Ultra tu Samsung Vietnam'                                   FROM dual UNION ALL
         SELECT 'MAC-AIR-M3-256',    'Apple Premium Reseller',     'IMPORT', 'PURCHASE',  8, 14, 'Nhap MacBook Air M3 tu APR'                                                         FROM dual UNION ALL
         SELECT 'CAB-USBC-2M',       'FPT Distribution',           'IMPORT', 'PURCHASE', 50, 10, 'Nhap cap USB-C so luong lon'                                                        FROM dual UNION ALL
         SELECT 'IPH-15PM-BLK',      NULL,                         'EXPORT', 'SALE',      3,  7, 'Xuat ban iPhone 15 PM qua don hang'                                                 FROM dual UNION ALL
         SELECT 'SAM-A55-256',       NULL,                         'EXPORT', 'SALE',      3,  5, 'Xuat ban Samsung A55 qua don hang'                                                  FROM dual
     ) v
         JOIN products  p ON p.sku   = v.sku
         LEFT JOIN suppliers s ON s.name = v.sup
WHERE NOT EXISTS (
    SELECT 1 FROM stock_movements sm
    WHERE sm.product_id  = p.id
      AND sm.type        = v.mv_type
      AND sm.action_type = v.act_type
      AND TRUNC(sm.created_at) = TRUNC(CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.days_ago, 'DAY'))
);

-- ── Audit logs ───────────────────────────────────────────────
-- FIX: tách thành 2 INSERT riêng theo offset unit (DAY vs HOUR)
-- vì NUMTODSINTERVAL không nhận string variable làm unit

INSERT INTO audit_logs (user_id, username, action, entity_name, entity_id, status, details, created_at, updated_at)
SELECT 1, 'SYSTEM', v.action, v.entity, v.eid, 'SUCCESS', v.log_detail,
       CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.days_ago, 'DAY'),
       CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.days_ago, 'DAY')
FROM (
         SELECT 'CREATE_PRODUCT' action, 'PRODUCT' entity, '1' eid, 'Admin tao san pham iPhone 15 Pro Max'              log_detail, 20 days_ago FROM dual UNION ALL
         SELECT 'IMPORT_STOCK',          'PRODUCT',         '1',    'Nhap kho 10 iPhone 15 PM - Apple Premium Reseller', 20                     FROM dual UNION ALL
         SELECT 'IMPORT_STOCK',          'PRODUCT',         '6',    'Nhap kho 8 MacBook Air M3 - Apple Premium Reseller',14                     FROM dual UNION ALL
         SELECT 'CREATE_ORDER',          'ORDER',            '1',    'Tao don hang - KH: Nguyen Minh Tuan - 29,900,000',  7                     FROM dual UNION ALL
         SELECT 'CREATE_ORDER',          'ORDER',            '5',    'Tao don hang - KH: Hoang Van Dung - MacBook Air M3',4                     FROM dual
     ) v
WHERE NOT EXISTS (
    SELECT 1 FROM audit_logs al
    WHERE al.user_id   = 1
      AND al.username = 'SYSTEM'
      AND al.action    = v.action
      AND al.entity_id = v.eid
      AND TRUNC(al.created_at) = TRUNC(CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.days_ago, 'DAY'))
);

-- ── Audit logs — HOUR offset ─────────────────────────────────
INSERT INTO audit_logs (user_id, username, action, entity_name, entity_id, status, details, created_at, updated_at)
SELECT 1, 'SYSTEM', v.action, v.entity, v.eid, 'SUCCESS', v.log_detail,
       CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.hours_ago, 'HOUR'),
       CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.hours_ago, 'HOUR')
FROM (
         SELECT 'CREATE_ORDER' action, 'ORDER'   entity, '12' eid, 'Tao don hang hom nay - iPhone 15 PM - 29,900,000',  1 hours_ago, 'Tao don hang hom nay - iPhone 15 PM - 29,900,000'  log_detail FROM dual UNION ALL
         SELECT 'CREATE_ORDER',        'ORDER',           '13',    'Tao don hang hom nay - Xiaomi 14 Pro - 17,200,000', 2,           'Tao don hang hom nay - Xiaomi 14 Pro - 17,200,000' FROM dual UNION ALL
         SELECT 'IMPORT_STOCK',        'PRODUCT',          '4',    'Nhap kho Samsung Galaxy A55 - 20 units',             3,           'Nhap kho Samsung Galaxy A55 - 20 units'            FROM dual
     ) v
WHERE NOT EXISTS (
    SELECT 1 FROM audit_logs al
    WHERE al.user_id   = 1
      AND al.username = 'SYSTEM'
      AND al.action    = v.action
      AND al.entity_id = v.eid
      AND al.created_at >= CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.hours_ago + 1, 'HOUR')
      AND al.created_at <  CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.hours_ago - 1, 'HOUR')
);

-- ── Warranty claims ──────────────────────────────────────────
-- FIX: cast NULL TO NUMBER(10) để Oracle infer đúng type trong UNION ALL

INSERT INTO warranty_claims (product_item_id, customer_id, created_by, issue_description, status, received_date, return_date)
SELECT pi.id, c.id, 1, v.issue, v.sts,
       CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.recv_days, 'DAY'),
       CASE WHEN v.ret_days IS NOT NULL
                THEN CURRENT_TIMESTAMP - NUMTODSINTERVAL(v.ret_days, 'DAY')
           END
FROM (
         SELECT '358045100001001' imei, '0901234567' ph, 'Man hinh iPhone 15 PM bi soc doc sau 3 thang'          issue, 'FIXING'   sts, 5  recv_days, CAST(NULL AS NUMBER(10)) ret_days FROM dual UNION ALL
         SELECT '352046200002001',      '0912345670',    'Samsung S24 Ultra khong nhan sac nhanh, pin hao nhanh', 'RECEIVED',       2,  CAST(NULL AS NUMBER(10))                        FROM dual UNION ALL
         SELECT 'C02ZM1YJMD6N001',      '0934567890',    'MacBook Air M3 ban phim bi liet 2 phim sau 1 thang',   'FIXED',          10, 3                                               FROM dual
     ) v
         JOIN product_items pi ON pi.imei        = v.imei
         JOIN customers     c  ON c.phone_number = v.ph
WHERE NOT EXISTS (
    SELECT 1 FROM warranty_claims wc
    WHERE wc.product_item_id = pi.id
      AND wc.customer_id     = c.id
);

COMMIT;