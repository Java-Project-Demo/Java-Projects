-- ============================================================
--  SEED DATA — UTC Warehouse Management System
--  Oracle 23c / XEPDB1 schema: admin123
-- ============================================================

-- ─── 1. USERS (thêm SALES + STOCK) ────────────────────────
INSERT INTO users (username, full_name, password, gender, phone_number, email, status, role_id, is_deleted, is_password_reset)
VALUES ('nv.binhnt', 'Nguyễn Thị Bình', '$2a$12$2H7sSIL9XV1aUV3qj87TIuUPgGwQTfnHuxFdAXYlWSXHxKyPgelB.', 0, '0912345678', 'binh.nt@utc.vn', 'ACTIVE', (SELECT id FROM roles WHERE name='SALES'), 0, 0);

INSERT INTO users (username, full_name, password, gender, phone_number, email, status, role_id, is_deleted, is_password_reset)
VALUES ('nv.hungpv', 'Phạm Văn Hùng', '$2a$12$2H7sSIL9XV1aUV3qj87TIuUPgGwQTfnHuxFdAXYlWSXHxKyPgelB.', 1, '0923456789', 'hung.pv@utc.vn', 'ACTIVE', (SELECT id FROM roles WHERE name='SALES'), 0, 0);

INSERT INTO users (username, full_name, password, gender, phone_number, email, status, role_id, is_deleted, is_password_reset)
VALUES ('nv.thanhlt', 'Lê Thị Thanh', '$2a$12$2H7sSIL9XV1aUV3qj87TIuUPgGwQTfnHuxFdAXYlWSXHxKyPgelB.', 0, '0934567890', 'thanh.lt@utc.vn', 'ACTIVE', (SELECT id FROM roles WHERE name='STOCK'), 0, 0);

COMMIT;

-- ─── 2. SUPPLIERS ──────────────────────────────────────────
INSERT INTO suppliers (name, contact_person, phone_number, email, address, tax_code, status)
VALUES ('FPT Distribution', 'Trần Văn Minh', '02473001234', 'contact@fpt-dist.vn', '17 Duy Tân, Cầu Giấy, Hà Nội', '0102050308', 'ACTIVE');

INSERT INTO suppliers (name, contact_person, phone_number, email, address, tax_code, status)
VALUES ('Digiworld Corporation', 'Nguyễn Hoàng Long', '02839300888', 'supply@digiworld.vn', '23 Nguyễn Đình Chiểu, Q3, TP.HCM', '0302869042', 'ACTIVE');

INSERT INTO suppliers (name, contact_person, phone_number, email, address, tax_code, status)
VALUES ('Samsung Vietnam', 'Kim Ji-hoon', '02439781234', 'b2b@samsung.com.vn', 'Yên Phong, Bắc Ninh', '2300441884', 'ACTIVE');

INSERT INTO suppliers (name, contact_person, phone_number, email, address, tax_code, status)
VALUES ('Apple Premium Reseller', 'Đặng Thị Lan', '02838227788', 'wholesale@apr.vn', '109 Nguyễn Du, Q1, TP.HCM', '0316785432', 'ACTIVE');

COMMIT;

-- ─── 3. CATEGORIES ────────────────────────────────────────
INSERT INTO categories (name, description) VALUES ('Điện thoại di động', 'Smartphone các thương hiệu: iPhone, Samsung, Xiaomi, OPPO');
INSERT INTO categories (name, description) VALUES ('Laptop & Máy tính', 'MacBook, Dell, ASUS, Lenovo và các dòng laptop thương hiệu');
INSERT INTO categories (name, description) VALUES ('Máy tính bảng', 'iPad, Samsung Galaxy Tab và máy tính bảng Android');
INSERT INTO categories (name, description) VALUES ('Phụ kiện điện thoại', 'Ốp lưng, kính cường lực, cáp sạc, tai nghe');
INSERT INTO categories (name, description) VALUES ('Thiết bị âm thanh', 'Tai nghe, loa bluetooth, airpods');

COMMIT;

-- ─── 4. PRODUCTS ──────────────────────────────────────────
-- Điện thoại di động
INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Điện thoại di động'), 'IPH-15PM-BLK', 'iPhone 15 Pro Max 256GB Black Titanium',
'Chip: A17 Pro | RAM: 8GB | Storage: 256GB | Camera: 48MP | Display: 6.7" Super Retina XDR', 12, 1, 25500000, 29900000, 8, 5, 'ACTIVE');

INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Điện thoại di động'), 'SAM-S24U-256', 'Samsung Galaxy S24 Ultra 256GB',
'Chip: Snapdragon 8 Gen 3 | RAM: 12GB | Storage: 256GB | Camera: 200MP | Display: 6.8" Dynamic AMOLED 2X', 12, 1, 22000000, 26500000, 12, 5, 'ACTIVE');

INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Điện thoại di động'), 'XIA-14PRO-512', 'Xiaomi 14 Pro 512GB',
'Chip: Snapdragon 8 Gen 3 | RAM: 16GB | Storage: 512GB | Camera: Leica 50MP | Display: 6.73" LTPO AMOLED', 12, 1, 13500000, 17200000, 6, 5, 'ACTIVE');

INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Điện thoại di động'), 'SAM-A55-256', 'Samsung Galaxy A55 256GB',
'Chip: Exynos 1480 | RAM: 8GB | Storage: 256GB | Camera: 50MP OIS | Display: 6.6" Super AMOLED', 12, 1, 6500000, 9200000, 15, 8, 'ACTIVE');

INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Điện thoại di động'), 'IPH-14-128', 'iPhone 14 128GB',
'Chip: A15 Bionic | RAM: 6GB | Storage: 128GB | Camera: 12MP | Display: 6.1" Super Retina XDR', 12, 1, 14500000, 18000000, 3, 5, 'ACTIVE');

-- Laptop
INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Laptop & Máy tính'), 'MAC-AIR-M3-256', 'MacBook Air 13" M3 256GB',
'Chip: Apple M3 | RAM: 8GB | Storage: 256GB SSD | Display: 13.6" Liquid Retina | Battery: 18h', 12, 1, 25800000, 30500000, 5, 3, 'ACTIVE');

INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Laptop & Máy tính'), 'DEL-XPS15-512', 'Dell XPS 15 512GB RTX4060',
'Chip: Intel Core i7-13700H | RAM: 16GB DDR5 | Storage: 512GB NVMe | GPU: RTX 4060 | Display: 15.6" OLED', 24, 1, 29500000, 35800000, 3, 3, 'ACTIVE');

INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Laptop & Máy tính'), 'ASU-ZEN14-512', 'ASUS ZenBook 14 OLED 512GB',
'Chip: Intel Core Ultra 7 155H | RAM: 16GB LPDDR5 | Storage: 512GB SSD | Display: 14" 2.8K OLED 120Hz', 12, 1, 17800000, 22500000, 7, 3, 'ACTIVE');

-- Máy tính bảng
INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Máy tính bảng'), 'IPD-PRO13-256', 'iPad Pro 13" M4 256GB WiFi',
'Chip: Apple M4 | RAM: 8GB | Storage: 256GB | Display: 13" Ultra Retina XDR OLED | Camera: 12MP ProRes', 12, 1, 20500000, 25500000, 4, 3, 'ACTIVE');

-- Phụ kiện
INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện điện thoại'), 'CAB-USBC-2M', 'Cáp USB-C to USB-C 2m 100W',
'Chiều dài: 2m | Hỗ trợ sạc nhanh 100W | Truyền dữ liệu USB 3.2 | Tương thích Apple, Samsung, ASUS', 6, 0, 85000, 180000, 45, 20, 'ACTIVE');

INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện điện thoại'), 'CHG-GAN65W', 'Sạc GaN 65W 3 cổng',
'Công suất: 65W | Cổng: 2x USB-C + 1x USB-A | Chuẩn sạc: PD 3.0, QC 4+ | Kích thước nhỏ gọn', 12, 0, 280000, 520000, 28, 15, 'ACTIVE');

INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Phụ kiện điện thoại'), 'CAS-IPH15-CLR', 'Ốp lưng iPhone 15 Pro Max trong suốt MagSafe',
'Chất liệu: TPU cao cấp | Hỗ trợ MagSafe | Chống sốc góc cạnh | Tương thích: iPhone 15 Pro Max', 3, 0, 120000, 290000, 32, 20, 'ACTIVE');

-- Thiết bị âm thanh
INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Thiết bị âm thanh'), 'APD-PRO2-WHT', 'AirPods Pro Gen 2 (USB-C)',
'Driver: H2 chip | ANC: Adaptive Transparency | Spatial Audio | Chống nước: IPX4 | Pin: 6h + 30h (case)', 12, 1, 4200000, 5800000, 9, 5, 'ACTIVE');

INSERT INTO products (category_id, sku, name, specifications, warranty_period, has_imei, price_import_std, price_export_std, current_stock, min_threshold, status)
VALUES ((SELECT id FROM categories WHERE name='Thiết bị âm thanh'), 'MOU-LGT-MX3', 'Chuột Logitech MX Master 3S',
'DPI: 200-8000 | Kết nối: Bluetooth + USB Receiver | Pin: Sạc USB-C 70 ngày | Phím cuộn MagSpeed', 12, 0, 1550000, 2200000, 2, 5, 'ACTIVE');

COMMIT;

-- ─── 5. CUSTOMERS ─────────────────────────────────────────
INSERT INTO customers (phone_number, full_name, email, address) VALUES ('0901234567', 'Nguyễn Minh Tuấn', 'tuan.nm@gmail.com', '45 Trần Hưng Đạo, Q1, TP.HCM');
INSERT INTO customers (phone_number, full_name, email, address) VALUES ('0912345670', 'Lê Thị Hoa', 'hoa.lt@gmail.com', '12 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội');
INSERT INTO customers (phone_number, full_name, email, address) VALUES ('0923456780', 'Phạm Quốc Đạt', 'dat.pq@outlook.com', '78 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM');
INSERT INTO customers (phone_number, full_name, email, address) VALUES ('0934567890', 'Trần Thị Mai', 'mai.tt@yahoo.com', '23 Nguyễn Văn Cừ, Q5, TP.HCM');
INSERT INTO customers (phone_number, full_name, email, address) VALUES ('0945678901', 'Hoàng Văn Dũng', 'dung.hv@gmail.com', '56 Bà Triệu, Hai Bà Trưng, Hà Nội');
INSERT INTO customers (phone_number, full_name, email, address) VALUES ('0956789012', 'Võ Thị Ngọc', 'ngoc.vt@gmail.com', '89 Lê Văn Sỹ, Q3, TP.HCM');
INSERT INTO customers (phone_number, full_name, email, address) VALUES ('0967890123', 'Đỗ Thanh Bình', 'binh.dt@gmail.com', '34 Phan Đình Phùng, Ba Đình, Hà Nội');
INSERT INTO customers (phone_number, full_name, email, address) VALUES ('0978901234', 'Bùi Thị Lan', 'lan.bt@hotmail.com', '67 Nguyễn Thị Minh Khai, Q1, TP.HCM');
INSERT INTO customers (phone_number, full_name, email, address) VALUES ('0989012345', 'Ngô Văn Hải', 'hai.nv@gmail.com', '90 Hai Bà Trưng, Q1, TP.HCM');
INSERT INTO customers (phone_number, full_name, email, address) VALUES ('0990123456', 'Đinh Thị Thu', 'thu.dt@gmail.com', '15 Trường Chinh, Tân Bình, TP.HCM');

COMMIT;

-- ─── 6. PRODUCT ITEMS (IMEI — AVAILABLE) ──────────────────
-- iPhone 15 Pro Max (stock=8)
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '358045100001001', 25500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '20' DAY
FROM products p, suppliers s WHERE p.sku='IPH-15PM-BLK' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '358045100001002', 25500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '20' DAY
FROM products p, suppliers s WHERE p.sku='IPH-15PM-BLK' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '358045100001003', 25500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '15' DAY
FROM products p, suppliers s WHERE p.sku='IPH-15PM-BLK' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '358045100001004', 25500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '15' DAY
FROM products p, suppliers s WHERE p.sku='IPH-15PM-BLK' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '358045100001005', 25500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '10' DAY
FROM products p, suppliers s WHERE p.sku='IPH-15PM-BLK' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '358045100001006', 25500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '10' DAY
FROM products p, suppliers s WHERE p.sku='IPH-15PM-BLK' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '358045100001007', 25500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '5' DAY
FROM products p, suppliers s WHERE p.sku='IPH-15PM-BLK' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '358045100001008', 25500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '5' DAY
FROM products p, suppliers s WHERE p.sku='IPH-15PM-BLK' AND s.name='Apple Premium Reseller';

-- Samsung S24 Ultra (stock=12, 6 items)
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '352046200002001', 22000000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '25' DAY
FROM products p, suppliers s WHERE p.sku='SAM-S24U-256' AND s.name='Samsung Vietnam';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '352046200002002', 22000000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '25' DAY
FROM products p, suppliers s WHERE p.sku='SAM-S24U-256' AND s.name='Samsung Vietnam';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '352046200002003', 22000000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '18' DAY
FROM products p, suppliers s WHERE p.sku='SAM-S24U-256' AND s.name='Samsung Vietnam';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '352046200002004', 22000000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '18' DAY
FROM products p, suppliers s WHERE p.sku='SAM-S24U-256' AND s.name='Samsung Vietnam';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '352046200002005', 22000000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '7' DAY
FROM products p, suppliers s WHERE p.sku='SAM-S24U-256' AND s.name='Samsung Vietnam';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '352046200002006', 22000000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '7' DAY
FROM products p, suppliers s WHERE p.sku='SAM-S24U-256' AND s.name='Samsung Vietnam';

-- Xiaomi 14 Pro (stock=6)
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '860047300003001', 13500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '12' DAY
FROM products p, suppliers s WHERE p.sku='XIA-14PRO-512' AND s.name='Digiworld Corporation';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '860047300003002', 13500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '12' DAY
FROM products p, suppliers s WHERE p.sku='XIA-14PRO-512' AND s.name='Digiworld Corporation';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '860047300003003', 13500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '6' DAY
FROM products p, suppliers s WHERE p.sku='XIA-14PRO-512' AND s.name='Digiworld Corporation';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '860047300003004', 13500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '6' DAY
FROM products p, suppliers s WHERE p.sku='XIA-14PRO-512' AND s.name='Digiworld Corporation';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '860047300003005', 13500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '2' DAY
FROM products p, suppliers s WHERE p.sku='XIA-14PRO-512' AND s.name='Digiworld Corporation';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '860047300003006', 13500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '2' DAY
FROM products p, suppliers s WHERE p.sku='XIA-14PRO-512' AND s.name='Digiworld Corporation';

-- iPhone 14 (stock=3, dưới ngưỡng 5 → cảnh báo)
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '358044900004001', 14500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '30' DAY
FROM products p, suppliers s WHERE p.sku='IPH-14-128' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '358044900004002', 14500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '30' DAY
FROM products p, suppliers s WHERE p.sku='IPH-14-128' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, '358044900004003', 14500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '30' DAY
FROM products p, suppliers s WHERE p.sku='IPH-14-128' AND s.name='Apple Premium Reseller';

-- MacBook Air M3 (stock=5)
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'C02ZM1YJMD6N001', 25800000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '14' DAY
FROM products p, suppliers s WHERE p.sku='MAC-AIR-M3-256' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'C02ZM1YJMD6N002', 25800000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '14' DAY
FROM products p, suppliers s WHERE p.sku='MAC-AIR-M3-256' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'C02ZM1YJMD6N003', 25800000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '8' DAY
FROM products p, suppliers s WHERE p.sku='MAC-AIR-M3-256' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'C02ZM1YJMD6N004', 25800000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '8' DAY
FROM products p, suppliers s WHERE p.sku='MAC-AIR-M3-256' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'C02ZM1YJMD6N005', 25800000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '3' DAY
FROM products p, suppliers s WHERE p.sku='MAC-AIR-M3-256' AND s.name='Apple Premium Reseller';

-- Dell XPS (stock=3, đúng ngưỡng → cảnh báo)
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'DXPS15FRGD50001', 29500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '22' DAY
FROM products p, suppliers s WHERE p.sku='DEL-XPS15-512' AND s.name='FPT Distribution';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'DXPS15FRGD50002', 29500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '22' DAY
FROM products p, suppliers s WHERE p.sku='DEL-XPS15-512' AND s.name='FPT Distribution';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'DXPS15FRGD50003', 29500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '10' DAY
FROM products p, suppliers s WHERE p.sku='DEL-XPS15-512' AND s.name='FPT Distribution';

-- ASUS ZenBook (stock=7)
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'AZEN14H7L3M0001', 17800000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '16' DAY
FROM products p, suppliers s WHERE p.sku='ASU-ZEN14-512' AND s.name='FPT Distribution';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'AZEN14H7L3M0002', 17800000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '16' DAY
FROM products p, suppliers s WHERE p.sku='ASU-ZEN14-512' AND s.name='FPT Distribution';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'AZEN14H7L3M0003', 17800000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '9' DAY
FROM products p, suppliers s WHERE p.sku='ASU-ZEN14-512' AND s.name='FPT Distribution';

-- iPad Pro (stock=4)
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'DMPP5X3YQKL0001', 20500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '11' DAY
FROM products p, suppliers s WHERE p.sku='IPD-PRO13-256' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'DMPP5X3YQKL0002', 20500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '11' DAY
FROM products p, suppliers s WHERE p.sku='IPD-PRO13-256' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'DMPP5X3YQKL0003', 20500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '4' DAY
FROM products p, suppliers s WHERE p.sku='IPD-PRO13-256' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'DMPP5X3YQKL0004', 20500000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '4' DAY
FROM products p, suppliers s WHERE p.sku='IPD-PRO13-256' AND s.name='Apple Premium Reseller';

-- AirPods Pro Gen 2 (stock=9)
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'APD2GEN2USB0001', 4200000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '18' DAY
FROM products p, suppliers s WHERE p.sku='APD-PRO2-WHT' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'APD2GEN2USB0002', 4200000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '18' DAY
FROM products p, suppliers s WHERE p.sku='APD-PRO2-WHT' AND s.name='Apple Premium Reseller';
INSERT INTO product_items (product_id, imei, cost_price, supplier_id, status, import_date)
SELECT p.id, 'APD2GEN2USB0003', 4200000, s.id, 'AVAILABLE', CURRENT_TIMESTAMP - INTERVAL '8' DAY
FROM products p, suppliers s WHERE p.sku='APD-PRO2-WHT' AND s.name='Apple Premium Reseller';

COMMIT;

-- ─── 7. ORDERS (quá khứ — COMPLETED) ─────────────────────
INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0901234567'), 29900000, 'TRANSFER', 'COMPLETED',
  CURRENT_TIMESTAMP - INTERVAL '7' DAY, CURRENT_TIMESTAMP - INTERVAL '7' DAY);

INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0912345670'), 26500000, 'CASH', 'COMPLETED',
  CURRENT_TIMESTAMP - INTERVAL '6' DAY, CURRENT_TIMESTAMP - INTERVAL '6' DAY);

INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0923456780'), 57400000, 'TRANSFER', 'COMPLETED',
  CURRENT_TIMESTAMP - INTERVAL '5' DAY, CURRENT_TIMESTAMP - INTERVAL '5' DAY);

INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0934567890'), 17200000, 'CASH', 'COMPLETED',
  CURRENT_TIMESTAMP - INTERVAL '4' DAY, CURRENT_TIMESTAMP - INTERVAL '4' DAY);

INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0945678901'), 25500000, 'CARD', 'COMPLETED',
  CURRENT_TIMESTAMP - INTERVAL '4' DAY, CURRENT_TIMESTAMP - INTERVAL '4' DAY);

INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0956789012'), 22500000, 'TRANSFER', 'COMPLETED',
  CURRENT_TIMESTAMP - INTERVAL '3' DAY, CURRENT_TIMESTAMP - INTERVAL '3' DAY);

INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0967890123'), 9200000, 'CASH', 'COMPLETED',
  CURRENT_TIMESTAMP - INTERVAL '2' DAY, CURRENT_TIMESTAMP - INTERVAL '2' DAY);

INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0978901234'), 18000000, 'TRANSFER', 'COMPLETED',
  CURRENT_TIMESTAMP - INTERVAL '2' DAY, CURRENT_TIMESTAMP - INTERVAL '2' DAY);

-- Đơn CANCELED
INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0989012345'), 30500000, 'TRANSFER', 'CANCELED',
  CURRENT_TIMESTAMP - INTERVAL '3' DAY, CURRENT_TIMESTAMP - INTERVAL '3' DAY);

INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0990123456'), 9200000, 'CASH', 'CANCELED',
  CURRENT_TIMESTAMP - INTERVAL '1' DAY, CURRENT_TIMESTAMP - INTERVAL '1' DAY);

-- Đơn PENDING hôm qua
INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0901234567'), 26500000, 'CARD', 'PENDING',
  CURRENT_TIMESTAMP - INTERVAL '1' DAY, CURRENT_TIMESTAMP - INTERVAL '1' DAY);

-- ─── 8. ORDERS HÔM NAY (COMPLETED → tính doanh thu) ──────
INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0901234567'), 29900000, 'TRANSFER', 'COMPLETED',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0912345670'), 17200000, 'CASH', 'COMPLETED',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0923456780'), 22500000, 'CARD', 'COMPLETED',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0945678901'), 5800000, 'CASH', 'COMPLETED',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- PENDING hôm nay
INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0934567890'), 35800000, 'TRANSFER', 'PENDING',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO orders (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
VALUES (1, (SELECT id FROM customers WHERE phone_number='0956789012'), 30500000, 'TRANSFER', 'PENDING',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;

-- ─── 9. ORDER ITEMS ────────────────────────────────────────
-- Order 1 (iPhone 15 PM)
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 29900000
FROM orders o, products p
WHERE o.total_amount=29900000 AND o.status='COMPLETED'
  AND o.created_at < CURRENT_TIMESTAMP - INTERVAL '6' DAY
  AND p.sku='IPH-15PM-BLK' AND ROWNUM=1;

-- Order 2 (Samsung S24U)
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 26500000
FROM orders o, products p
WHERE o.total_amount=26500000 AND o.status='COMPLETED'
  AND o.created_at < CURRENT_TIMESTAMP - INTERVAL '5' DAY
  AND p.sku='SAM-S24U-256' AND ROWNUM=1;

-- Order 3 (iPhone 15 PM + Samsung A55)
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 1, 29900000
FROM orders o, products p
WHERE o.total_amount=57400000 AND o.status='COMPLETED' AND p.sku='IPH-15PM-BLK' AND ROWNUM=1;
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT o.id, p.id, 3, 9200000
FROM orders o, products p
WHERE o.total_amount=57400000 AND o.status='COMPLETED' AND p.sku='SAM-A55-256' AND ROWNUM=1;

COMMIT;

-- ─── 10. STOCK MOVEMENTS ───────────────────────────────────
INSERT INTO stock_movements (product_id, type, action_type, quantity, supplier_id, created_by, note, created_at, updated_at)
SELECT p.id, 'IMPORT', 'PURCHASE', 10, s.id, 1, 'Nhập lô iPhone 15 Pro Max đầu tiên', CURRENT_TIMESTAMP - INTERVAL '20' DAY, CURRENT_TIMESTAMP - INTERVAL '20' DAY
FROM products p, suppliers s WHERE p.sku='IPH-15PM-BLK' AND s.name='Apple Premium Reseller';

INSERT INTO stock_movements (product_id, type, action_type, quantity, supplier_id, created_by, note, created_at, updated_at)
SELECT p.id, 'IMPORT', 'PURCHASE', 15, s.id, 1, 'Nhập Samsung Galaxy S24 Ultra từ Samsung Vietnam', CURRENT_TIMESTAMP - INTERVAL '25' DAY, CURRENT_TIMESTAMP - INTERVAL '25' DAY
FROM products p, suppliers s WHERE p.sku='SAM-S24U-256' AND s.name='Samsung Vietnam';

INSERT INTO stock_movements (product_id, type, action_type, quantity, supplier_id, created_by, note, created_at, updated_at)
SELECT p.id, 'IMPORT', 'PURCHASE', 8, s.id, 1, 'Nhập MacBook Air M3 từ APR', CURRENT_TIMESTAMP - INTERVAL '14' DAY, CURRENT_TIMESTAMP - INTERVAL '14' DAY
FROM products p, suppliers s WHERE p.sku='MAC-AIR-M3-256' AND s.name='Apple Premium Reseller';

INSERT INTO stock_movements (product_id, type, action_type, quantity, supplier_id, created_by, note, created_at, updated_at)
SELECT p.id, 'EXPORT', 'SALE', 3, NULL, 1, 'Xuất bán qua đơn hàng', CURRENT_TIMESTAMP - INTERVAL '7' DAY, CURRENT_TIMESTAMP - INTERVAL '7' DAY
FROM products p WHERE p.sku='IPH-15PM-BLK';

INSERT INTO stock_movements (product_id, type, action_type, quantity, supplier_id, created_by, note, created_at, updated_at)
SELECT p.id, 'EXPORT', 'SALE', 3, NULL, 1, 'Xuất bán Samsung A55', CURRENT_TIMESTAMP - INTERVAL '5' DAY, CURRENT_TIMESTAMP - INTERVAL '5' DAY
FROM products p WHERE p.sku='SAM-A55-256';

INSERT INTO stock_movements (product_id, type, action_type, quantity, supplier_id, created_by, note, created_at, updated_at)
SELECT p.id, 'IMPORT', 'PURCHASE', 50, s.id, 1, 'Nhập cáp USB-C số lượng lớn', CURRENT_TIMESTAMP - INTERVAL '10' DAY, CURRENT_TIMESTAMP - INTERVAL '10' DAY
FROM products p, suppliers s WHERE p.sku='CAB-USBC-2M' AND s.name='FPT Distribution';

COMMIT;

-- ─── 11. AUDIT LOGS ────────────────────────────────────────
INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'CREATE_PRODUCT', 'PRODUCT', '1', 'SUCCESS', 'Admin tạo sản phẩm iPhone 15 Pro Max', CURRENT_TIMESTAMP - INTERVAL '20' DAY, CURRENT_TIMESTAMP - INTERVAL '20' DAY);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'IMPORT_STOCK', 'PRODUCT', '1', 'SUCCESS', 'Nhập kho 10 iPhone 15 PM từ Apple Premium Reseller', CURRENT_TIMESTAMP - INTERVAL '20' DAY, CURRENT_TIMESTAMP - INTERVAL '20' DAY);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'CREATE_ORDER', 'ORDER', '1', 'SUCCESS', 'Tạo đơn hàng - KH: Nguyễn Minh Tuấn - 29,900,000₫', CURRENT_TIMESTAMP - INTERVAL '7' DAY, CURRENT_TIMESTAMP - INTERVAL '7' DAY);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'IMPORT_STOCK', 'PRODUCT', '6', 'SUCCESS', 'Nhập kho 8 MacBook Air M3 từ Apple Premium Reseller', CURRENT_TIMESTAMP - INTERVAL '14' DAY, CURRENT_TIMESTAMP - INTERVAL '14' DAY);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'CREATE_ORDER', 'ORDER', '5', 'SUCCESS', 'Tạo đơn hàng - KH: Hoàng Văn Dũng - MacBook Air M3', CURRENT_TIMESTAMP - INTERVAL '4' DAY, CURRENT_TIMESTAMP - INTERVAL '4' DAY);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'CREATE_ORDER', 'ORDER', '12', 'SUCCESS', 'Tạo đơn hàng hôm nay - iPhone 15 PM - 29,900,000₫', CURRENT_TIMESTAMP - INTERVAL '1' HOUR, CURRENT_TIMESTAMP - INTERVAL '1' HOUR);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'CREATE_ORDER', 'ORDER', '13', 'SUCCESS', 'Tạo đơn hàng hôm nay - Xiaomi 14 Pro - 17,200,000₫', CURRENT_TIMESTAMP - INTERVAL '2' HOUR, CURRENT_TIMESTAMP - INTERVAL '2' HOUR);

INSERT INTO audit_logs (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
VALUES (1, 'IMPORT_STOCK', 'PRODUCT', '4', 'SUCCESS', 'Nhập kho Samsung Galaxy A55 - 20 units', CURRENT_TIMESTAMP - INTERVAL '3' HOUR, CURRENT_TIMESTAMP - INTERVAL '3' HOUR);

COMMIT;

-- ─── 12. WARRANTY CLAIMS ───────────────────────────────────
INSERT INTO warranty_claims (product_item_id, customer_id, created_by, issue_description, status, received_date)
SELECT pi.id, c.id, 1, 'Màn hình iPhone 15 PM bị sọc dọc sau 3 tháng sử dụng', 'FIXING',
  CURRENT_TIMESTAMP - INTERVAL '5' DAY
FROM product_items pi, customers c
WHERE pi.imei='358045100001001' AND c.phone_number='0901234567';

INSERT INTO warranty_claims (product_item_id, customer_id, created_by, issue_description, status, received_date)
SELECT pi.id, c.id, 1, 'Samsung S24 Ultra không nhận sạc nhanh, pin hao nhanh bất thường', 'RECEIVED',
  CURRENT_TIMESTAMP - INTERVAL '2' DAY
FROM product_items pi, customers c
WHERE pi.imei='352046200002001' AND c.phone_number='0912345670';

INSERT INTO warranty_claims (product_item_id, customer_id, created_by, issue_description, status, received_date, return_date)
SELECT pi.id, c.id, 1, 'MacBook Air M3 bàn phím bị liệt 2 phím sau 1 tháng', 'FIXED',
  CURRENT_TIMESTAMP - INTERVAL '10' DAY, CURRENT_TIMESTAMP - INTERVAL '3' DAY
FROM product_items pi, customers c
WHERE pi.imei='C02ZM1YJMD6N001' AND c.phone_number='0934567890';

COMMIT;
