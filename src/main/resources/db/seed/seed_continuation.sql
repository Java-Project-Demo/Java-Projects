SET DEFINE OFF

-- ─── Laptop category (& bị escape bởi SET DEFINE OFF) ────
INSERT INTO categories (name, description)
VALUES ('Laptop va May tinh', 'MacBook, Dell, ASUS, Lenovo va cac dong laptop thuong hieu');

COMMIT;

-- ─── 3 sản phẩm Laptop còn thiếu ─────────────────────────
INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Laptop va May tinh'),
'MAC-AIR-M3-256', 'MacBook Air 13 inch M3 256GB',
'Chip: Apple M3 | RAM: 8GB | Storage: 256GB SSD | Display: 13.6 inch Liquid Retina | Battery: 18h',
12, 1, 25800000, 30500000, 5, 3, 'ACTIVE');

INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Laptop va May tinh'),
'DEL-XPS15-512', 'Dell XPS 15 512GB RTX4060',
'Chip: Intel Core i7-13700H | RAM: 16GB DDR5 | Storage: 512GB NVMe | GPU: RTX 4060 | Display: 15.6 inch OLED',
24, 1, 29500000, 35800000, 3, 3, 'ACTIVE');

INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Laptop va May tinh'),
'ASU-ZEN14-512', 'ASUS ZenBook 14 OLED 512GB',
'Chip: Intel Core Ultra 7 155H | RAM: 16GB LPDDR5 | Storage: 512GB SSD | Display: 14 inch 2.8K OLED 120Hz',
12, 1, 17800000, 22500000, 7, 3, 'ACTIVE');

COMMIT;

-- ─── PRODUCT ITEMS (dùng supplier_name thay vì FK) ───────

-- iPhone 15 Pro Max (8 available)
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '358045100001001', 25500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '20' DAY FROM products WHERE sku='IPH-15PM-BLK';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '358045100001002', 25500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '20' DAY FROM products WHERE sku='IPH-15PM-BLK';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '358045100001003', 25500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '15' DAY FROM products WHERE sku='IPH-15PM-BLK';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '358045100001004', 25500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '15' DAY FROM products WHERE sku='IPH-15PM-BLK';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '358045100001005', 25500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '10' DAY FROM products WHERE sku='IPH-15PM-BLK';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '358045100001006', 25500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '10' DAY FROM products WHERE sku='IPH-15PM-BLK';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '358045100001007', 25500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '5' DAY FROM products WHERE sku='IPH-15PM-BLK';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '358045100001008', 25500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '5' DAY FROM products WHERE sku='IPH-15PM-BLK';

-- Samsung S24 Ultra (6 items để demo, stock=12)
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '352046200002001', 22000000, 'Samsung Vietnam', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '25' DAY FROM products WHERE sku='SAM-S24U-256';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '352046200002002', 22000000, 'Samsung Vietnam', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '25' DAY FROM products WHERE sku='SAM-S24U-256';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '352046200002003', 22000000, 'Samsung Vietnam', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '18' DAY FROM products WHERE sku='SAM-S24U-256';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '352046200002004', 22000000, 'Samsung Vietnam', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '18' DAY FROM products WHERE sku='SAM-S24U-256';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '352046200002005', 22000000, 'Samsung Vietnam', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '7' DAY FROM products WHERE sku='SAM-S24U-256';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '352046200002006', 22000000, 'Samsung Vietnam', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '7' DAY FROM products WHERE sku='SAM-S24U-256';

-- Xiaomi 14 Pro (6 available)
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '860047300003001', 13500000, 'Digiworld Corporation', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '12' DAY FROM products WHERE sku='XIA-14PRO-512';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '860047300003002', 13500000, 'Digiworld Corporation', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '12' DAY FROM products WHERE sku='XIA-14PRO-512';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '860047300003003', 13500000, 'Digiworld Corporation', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '6' DAY FROM products WHERE sku='XIA-14PRO-512';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '860047300003004', 13500000, 'Digiworld Corporation', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '6' DAY FROM products WHERE sku='XIA-14PRO-512';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '860047300003005', 13500000, 'Digiworld Corporation', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '2' DAY FROM products WHERE sku='XIA-14PRO-512';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '860047300003006', 13500000, 'Digiworld Corporation', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '2' DAY FROM products WHERE sku='XIA-14PRO-512';

-- iPhone 14 (3 available — dưới ngưỡng 5, cảnh báo)
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '358044900004001', 14500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '30' DAY FROM products WHERE sku='IPH-14-128';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '358044900004002', 14500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '30' DAY FROM products WHERE sku='IPH-14-128';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, '358044900004003', 14500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '30' DAY FROM products WHERE sku='IPH-14-128';

-- MacBook Air M3 (5 available)
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'C02ZM1YJMD6N001', 25800000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '14' DAY FROM products WHERE sku='MAC-AIR-M3-256';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'C02ZM1YJMD6N002', 25800000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '14' DAY FROM products WHERE sku='MAC-AIR-M3-256';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'C02ZM1YJMD6N003', 25800000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '8' DAY FROM products WHERE sku='MAC-AIR-M3-256';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'C02ZM1YJMD6N004', 25800000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '8' DAY FROM products WHERE sku='MAC-AIR-M3-256';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'C02ZM1YJMD6N005', 25800000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '3' DAY FROM products WHERE sku='MAC-AIR-M3-256';

-- Dell XPS 15 (3 — đúng ngưỡng, cảnh báo)
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'DXPS15FRGD50001', 29500000, 'FPT Distribution', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '22' DAY FROM products WHERE sku='DEL-XPS15-512';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'DXPS15FRGD50002', 29500000, 'FPT Distribution', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '22' DAY FROM products WHERE sku='DEL-XPS15-512';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'DXPS15FRGD50003', 29500000, 'FPT Distribution', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '10' DAY FROM products WHERE sku='DEL-XPS15-512';

-- ASUS ZenBook (3 items trong số 7)
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'AZEN14H7L3M0001', 17800000, 'FPT Distribution', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '16' DAY FROM products WHERE sku='ASU-ZEN14-512';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'AZEN14H7L3M0002', 17800000, 'FPT Distribution', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '16' DAY FROM products WHERE sku='ASU-ZEN14-512';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'AZEN14H7L3M0003', 17800000, 'FPT Distribution', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '9' DAY FROM products WHERE sku='ASU-ZEN14-512';

-- iPad Pro (4 available)
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'DMPP5X3YQKL0001', 20500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '11' DAY FROM products WHERE sku='IPD-PRO13-256';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'DMPP5X3YQKL0002', 20500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '11' DAY FROM products WHERE sku='IPD-PRO13-256';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'DMPP5X3YQKL0003', 20500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '4' DAY FROM products WHERE sku='IPD-PRO13-256';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'DMPP5X3YQKL0004', 20500000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '4' DAY FROM products WHERE sku='IPD-PRO13-256';

-- AirPods Pro Gen 2 (3 items)
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'APD2GEN2USB0001', 4200000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '18' DAY FROM products WHERE sku='APD-PRO2-WHT';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'APD2GEN2USB0002', 4200000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '18' DAY FROM products WHERE sku='APD-PRO2-WHT';
INSERT INTO product_items (product_id, imei, cost_price, supplier_name, status, import_date)
SELECT id, 'APD2GEN2USB0003', 4200000, 'Apple Premium Reseller', 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '8' DAY FROM products WHERE sku='APD-PRO2-WHT';

COMMIT;

-- ─── ORDER ITEMS (gắn vào orders đã có) ──────────────────
-- Lấy order đầu tiên có total=29900000 COMPLETED quá khứ
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 29900000
FROM orders o, products p
WHERE o.total_amount=29900000 AND o.status='COMPLETED'
  AND o.created_at < TRUNC(CURRENT_TIMESTAMP) AND p.sku='IPH-15PM-BLK' AND ROWNUM=1;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 26500000
FROM orders o, products p
WHERE o.total_amount=26500000 AND o.status='COMPLETED'
  AND o.created_at < TRUNC(CURRENT_TIMESTAMP) AND p.sku='SAM-S24U-256' AND ROWNUM=1;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 29900000
FROM orders o, products p
WHERE o.total_amount=57400000 AND o.status='COMPLETED' AND p.sku='IPH-15PM-BLK' AND ROWNUM=1;
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 3, 9200000
FROM orders o, products p
WHERE o.total_amount=57400000 AND o.status='COMPLETED' AND p.sku='SAM-A55-256' AND ROWNUM=1;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 17200000
FROM orders o, products p
WHERE o.total_amount=17200000 AND o.status='COMPLETED'
  AND o.created_at < TRUNC(CURRENT_TIMESTAMP) AND p.sku='XIA-14PRO-512' AND ROWNUM=1;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 25500000
FROM orders o, products p
WHERE o.total_amount=25500000 AND o.status='COMPLETED' AND p.sku='IPD-PRO13-256' AND ROWNUM=1;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 22500000
FROM orders o, products p
WHERE o.total_amount=22500000 AND o.status='COMPLETED'
  AND o.created_at < TRUNC(CURRENT_TIMESTAMP) AND p.sku='ASU-ZEN14-512' AND ROWNUM=1;

-- Today orders
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 29900000
FROM orders o, products p
WHERE o.total_amount=29900000 AND o.status='COMPLETED'
  AND TRUNC(o.created_at) = TRUNC(CURRENT_TIMESTAMP) AND p.sku='IPH-15PM-BLK' AND ROWNUM=1;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 17200000
FROM orders o, products p
WHERE o.total_amount=17200000 AND o.status='COMPLETED'
  AND TRUNC(o.created_at) = TRUNC(CURRENT_TIMESTAMP) AND p.sku='XIA-14PRO-512' AND ROWNUM=1;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 22500000
FROM orders o, products p
WHERE o.total_amount=22500000 AND o.status='COMPLETED'
  AND TRUNC(o.created_at) = TRUNC(CURRENT_TIMESTAMP) AND p.sku='ASU-ZEN14-512' AND ROWNUM=1;

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 5800000
FROM orders o, products p
WHERE o.total_amount=5800000 AND o.status='COMPLETED' AND p.sku='APD-PRO2-WHT' AND ROWNUM=1;

COMMIT;

-- ─── STOCK MOVEMENTS (không có supplier_id) ───────────────
INSERT INTO stock_movements (product_id, type, action_type, quantity, created_by, note, created_at, updated_at)
SELECT id, 'IMPORT', 'PURCHASE', 11, 1, 'Nhap lo iPhone 15 Pro Max', CURRENT_TIMESTAMP - INTERVAL '20' DAY, CURRENT_TIMESTAMP - INTERVAL '20' DAY FROM products WHERE sku='IPH-15PM-BLK';

INSERT INTO stock_movements (product_id, type, action_type, quantity, created_by, note, created_at, updated_at)
SELECT id, 'IMPORT', 'PURCHASE', 15, 1, 'Nhap Samsung Galaxy S24 Ultra tu Samsung Vietnam', CURRENT_TIMESTAMP - INTERVAL '25' DAY, CURRENT_TIMESTAMP - INTERVAL '25' DAY FROM products WHERE sku='SAM-S24U-256';

INSERT INTO stock_movements (product_id, type, action_type, quantity, created_by, note, created_at, updated_at)
SELECT id, 'IMPORT', 'PURCHASE', 7, 1, 'Nhap MacBook Air M3 tu Apple Premium Reseller', CURRENT_TIMESTAMP - INTERVAL '14' DAY, CURRENT_TIMESTAMP - INTERVAL '14' DAY FROM products WHERE sku='MAC-AIR-M3-256';

INSERT INTO stock_movements (product_id, type, action_type, quantity, created_by, note, created_at, updated_at)
SELECT id, 'IMPORT', 'PURCHASE', 50, 1, 'Nhap cap USB-C so luong lon', CURRENT_TIMESTAMP - INTERVAL '10' DAY, CURRENT_TIMESTAMP - INTERVAL '10' DAY FROM products WHERE sku='CAB-USBC-2M';

INSERT INTO stock_movements (product_id, type, action_type, quantity, created_by, note, created_at, updated_at)
SELECT id, 'EXPORT', 'SALE', 3, 1, 'Xuat ban iPhone 15 PM qua don hang', CURRENT_TIMESTAMP - INTERVAL '7' DAY, CURRENT_TIMESTAMP - INTERVAL '7' DAY FROM products WHERE sku='IPH-15PM-BLK';

INSERT INTO stock_movements (product_id, type, action_type, quantity, created_by, note, created_at, updated_at)
SELECT id, 'EXPORT', 'SALE', 3, 1, 'Xuat ban Samsung A55 qua don hang', CURRENT_TIMESTAMP - INTERVAL '5' DAY, CURRENT_TIMESTAMP - INTERVAL '5' DAY FROM products WHERE sku='SAM-A55-256';

INSERT INTO stock_movements (product_id, type, action_type, quantity, created_by, note, created_at, updated_at)
SELECT id, 'IMPORT', 'PURCHASE', 12, 1, 'Nhap AirPods Pro Gen 2 - lo hang moi', CURRENT_TIMESTAMP - INTERVAL '18' DAY, CURRENT_TIMESTAMP - INTERVAL '18' DAY FROM products WHERE sku='APD-PRO2-WHT';

COMMIT;

-- ─── AUDIT LOGS (bổ sung) ─────────────────────────────────
INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'CREATE_PRODUCT', 'PRODUCT', '1', 'SUCCESS', 'Admin tao san pham iPhone 15 Pro Max', CURRENT_TIMESTAMP - INTERVAL '20' DAY, CURRENT_TIMESTAMP - INTERVAL '20' DAY);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'IMPORT_STOCK', 'PRODUCT', '1', 'SUCCESS', 'Nhap kho 11 iPhone 15 PM - Apple Premium Reseller', CURRENT_TIMESTAMP - INTERVAL '20' DAY, CURRENT_TIMESTAMP - INTERVAL '20' DAY);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'IMPORT_STOCK', 'PRODUCT', '6', 'SUCCESS', 'Nhap kho 7 MacBook Air M3 - Apple Premium Reseller', CURRENT_TIMESTAMP - INTERVAL '14' DAY, CURRENT_TIMESTAMP - INTERVAL '14' DAY);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'CREATE_ORDER', 'ORDER', '1', 'SUCCESS', 'Tao don hang - KH: Nguyen Minh Tuan - iPhone 15 PM - 29,900,000', CURRENT_TIMESTAMP - INTERVAL '7' DAY, CURRENT_TIMESTAMP - INTERVAL '7' DAY);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'CREATE_ORDER', 'ORDER', '12', 'SUCCESS', 'Tao don hang hom nay - iPhone 15 PM - 29,900,000', CURRENT_TIMESTAMP - INTERVAL '2' HOUR, CURRENT_TIMESTAMP - INTERVAL '2' HOUR);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'CREATE_ORDER', 'ORDER', '13', 'SUCCESS', 'Tao don hang hom nay - Xiaomi 14 Pro - 17,200,000', CURRENT_TIMESTAMP - INTERVAL '1' HOUR, CURRENT_TIMESTAMP - INTERVAL '1' HOUR);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'IMPORT_STOCK', 'PRODUCT', '4', 'SUCCESS', 'Nhap kho Samsung Galaxy A55 - 20 units tu Samsung Vietnam', CURRENT_TIMESTAMP - INTERVAL '30' MINUTE, CURRENT_TIMESTAMP - INTERVAL '30' MINUTE);

COMMIT;

-- ─── WARRANTY CLAIMS ──────────────────────────────────────
INSERT INTO warranty_claims (product_item_id, customer_id, created_by, issue_description, status, received_date)
SELECT pi.id, c.id, 1, 'Man hinh iPhone 15 PM bi soc doc sau 3 thang su dung', 'FIXING', CURRENT_TIMESTAMP - INTERVAL '5' DAY
FROM product_items pi, customers c
WHERE pi.imei='358045100001001' AND c.phone_number='0901234567';

INSERT INTO warranty_claims (product_item_id, customer_id, created_by, issue_description, status, received_date)
SELECT pi.id, c.id, 1, 'Samsung S24 Ultra khong nhan sac nhanh, pin hao nhanh bat thuong', 'RECEIVED', CURRENT_TIMESTAMP - INTERVAL '2' DAY
FROM product_items pi, customers c
WHERE pi.imei='352046200002001' AND c.phone_number='0912345670';

INSERT INTO warranty_claims (product_item_id, customer_id, created_by, issue_description, status, received_date, return_date)
SELECT pi.id, c.id, 1, 'MacBook Air M3 ban phim bi liet 2 phim sau 1 thang', 'FIXED', CURRENT_TIMESTAMP - INTERVAL '10' DAY, CURRENT_TIMESTAMP - INTERVAL '3' DAY
FROM product_items pi, customers c
WHERE pi.imei='C02ZM1YJMD6N001' AND c.phone_number='0934567890';

COMMIT;

-- ─── Verify kết quả ───────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM users)           AS users,
  (SELECT COUNT(*) FROM categories)      AS categories,
  (SELECT COUNT(*) FROM products)        AS products,
  (SELECT COUNT(*) FROM customers)       AS customers,
  (SELECT COUNT(*) FROM product_items)   AS product_items,
  (SELECT COUNT(*) FROM orders)          AS orders,
  (SELECT COUNT(*) FROM order_items)     AS order_items,
  (SELECT COUNT(*) FROM stock_movements) AS stock_mvts,
  (SELECT COUNT(*) FROM audit_logs)      AS audit_logs,
  (SELECT COUNT(*) FROM warranty_claims) AS warranties
FROM dual;
