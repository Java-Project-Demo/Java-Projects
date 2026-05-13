MERGE INTO suppliers t
USING (
    SELECT 'FPT Distribution'       name, 'Tran Van Minh'     cp, '02473001234' ph, 'contact@fpt-dist.vn'  em, '17 Duy Tan, Cau Giay, Ha Noi'     addr, '0102050308' tax FROM dual UNION ALL
    SELECT 'Digiworld Corporation',      'Nguyen Hoang Long',     '02839300888', 'supply@digiworld.vn',    '23 Nguyen Dinh Chieu, Q3, TP.HCM',        '0302869042'       FROM dual UNION ALL
    SELECT 'Samsung Vietnam',            'Kim Ji-hoon',           '02439781234', 'b2b@samsung.com.vn',     'Yen Phong, Bac Ninh',                      '2300441884'       FROM dual UNION ALL
    SELECT 'Apple Premium Reseller',     'Dang Thi Lan',          '02838227788', 'wholesale@apr.vn',       '109 Nguyen Du, Q1, TP.HCM',                '0316785432'       FROM dual
) s ON (t.name = s.name)
WHEN MATCHED     THEN UPDATE SET t.contact_person = s.cp, t.updated_at = CURRENT_TIMESTAMP
WHEN NOT MATCHED THEN INSERT (name, contact_person, phone_number, email, address, tax_code)
                      VALUES (s.name, s.cp, s.ph, s.em, s.addr, s.tax);

-- Categories: MERGE
MERGE INTO categories t
USING (
    SELECT 'Dien thoai di dong' name, 'Smartphone: iPhone, Samsung, Xiaomi, OPPO' desc_ FROM dual UNION ALL
    SELECT 'Laptop & May tinh',       'MacBook, Dell, ASUS, Lenovo'                      FROM dual UNION ALL
    SELECT 'May tinh bang',           'iPad, Samsung Galaxy Tab'                          FROM dual UNION ALL
    SELECT 'Phu kien dien thoai',     'Op lung, cap sac, tai nghe'                        FROM dual UNION ALL
    SELECT 'Thiet bi am thanh',       'Tai nghe, loa bluetooth, AirPods'                  FROM dual
) s ON (t.name = s.name)
WHEN MATCHED     THEN UPDATE SET t.description = s.desc_, t.updated_at = CURRENT_TIMESTAMP
WHEN NOT MATCHED THEN INSERT (name, description) VALUES (s.name, s.desc_);

-- Products: MERGE on sku
MERGE INTO products t
USING (
    WITH cat AS (SELECT id, name FROM categories)
    SELECT c.id cat_id, v.sku, v.pname,v.img_url, v.specs, v.wty, v.imei,
           v.imp, v.exp, v.stk, v.thr
    FROM (
             SELECT 'Dien thoai di dong' cat,'IPH-15PM-BLK' sku,'iPhone 15 Pro Max 256GB' pname,'Chip: A17 Pro | RAM: 8GB | 256GB | 48MP'       specs, 'https://picsum.photos/500/600' img_url, 12 wty,1 imei,25500000 imp,29900000 exp, 8 stk,5 thr FROM dual UNION ALL
             SELECT 'Dien thoai di dong',    'SAM-S24U-256',    'Samsung Galaxy S24 Ultra 256GB',    'Chip: SD8 Gen3 | RAM: 12GB | 200MP',        'https://picsum.photos/500/600' ,     12,1,22000000,26500000,12,5 FROM dual UNION ALL
             SELECT 'Dien thoai di dong',    'XIA-14PRO-512',   'Xiaomi 14 Pro 512GB',               'Chip: SD8 Gen3 | RAM: 16GB | Leica 50MP',   'https://picsum.photos/500/600' ,     12,1,13500000,17200000, 6,5 FROM dual UNION ALL
             SELECT 'Dien thoai di dong',    'SAM-A55-256',     'Samsung Galaxy A55 256GB',          'Chip: Exynos 1480 | RAM: 8GB | 50MP OIS',   'https://picsum.photos/500/600' ,     12,1, 6500000, 9200000,15,8 FROM dual UNION ALL
             SELECT 'Dien thoai di dong',    'IPH-14-128',      'iPhone 14 128GB',                   'Chip: A15 Bionic | RAM: 6GB | 12MP',        'https://picsum.photos/500/600' ,     12,1,14500000,18000000, 3,5 FROM dual UNION ALL
             SELECT 'Laptop & May tinh',     'MAC-AIR-M3-256',  'MacBook Air 13 M3 256GB',           'Chip: M3 | RAM: 8GB | 256GB SSD | 18h',     'https://picsum.photos/500/600' ,     12,1,25800000,30500000, 5,3 FROM dual UNION ALL
             SELECT 'Laptop & May tinh',     'DEL-XPS15-512',   'Dell XPS 15 512GB RTX4060',         'i7-13700H | 16GB | RTX4060 | OLED 15.6',    'https://picsum.photos/500/600' ,     24,1,29500000,35800000, 3,3 FROM dual UNION ALL
             SELECT 'Laptop & May tinh',     'ASU-ZEN14-512',   'ASUS ZenBook 14 OLED 512GB',        'Ultra 7 155H | 16GB | 512GB | 2.8K 120Hz',  'https://picsum.photos/500/600' ,     12,1,17800000,22500000, 7,3 FROM dual UNION ALL
             SELECT 'May tinh bang',         'IPD-PRO13-256',   'iPad Pro 13 M4 256GB WiFi',         'M4 | 8GB | OLED 13 | 12MP ProRes',          'https://picsum.photos/500/600' ,     12,1,20500000,25500000, 4,3 FROM dual UNION ALL
             SELECT 'Phu kien dien thoai',   'CAB-USBC-2M',     'Cap USB-C 2m 100W',                 '2m | 100W | USB 3.2',                       'https://picsum.photos/500/600' ,     6,0,   85000,  180000,45,20 FROM dual UNION ALL
             SELECT 'Phu kien dien thoai',   'CHG-GAN65W',      'Sac GaN 65W 3 cong',                '65W | 2xUSB-C + 1xUSB-A | PD3.0 QC4+',      'https://picsum.photos/500/600' ,     12,0,  280000,  520000,28,15 FROM dual UNION ALL
             SELECT 'Phu kien dien thoai',   'CAS-IPH15-CLR',   'Op lung iPhone 15 Pro Max MagSafe', 'TPU | MagSafe | iPhone 15 Pro Max',         'https://picsum.photos/500/600' ,     3,0,  120000,  290000,32,20 FROM dual UNION ALL
             SELECT 'Thiet bi am thanh',     'APD-PRO2-WHT',    'AirPods Pro Gen 2 USB-C',           'H2 | ANC | Spatial Audio | IPX4 | 6h+30h',  'https://picsum.photos/500/600' ,     12,1, 4200000, 5800000, 9,5 FROM dual UNION ALL
             SELECT 'Thiet bi am thanh',     'MOU-LGT-MX3',     'Chuot Logitech MX Master 3S',       'DPI 200-8000 | BT+USB | 70 ngay | MagSpeed','https://picsum.photos/500/600' ,     12,0, 1550000, 2200000, 2,5 FROM dual
         ) v JOIN cat c ON c.name = v.cat
) s ON (t.sku = s.sku)
WHEN MATCHED THEN UPDATE SET
                             t.name             = s.pname,
                             t.image_url        = s.img_url,
                             t.price_import_std = s.imp,
                             t.price_export_std = s.exp,
                             t.updated_at       = CURRENT_TIMESTAMP
WHEN NOT MATCHED THEN INSERT
                      (category_id, sku, name, specifications, image_url, warranty_period, has_imei,
                       price_import_std, price_export_std, current_stock, min_threshold)
                      VALUES (s.cat_id, s.sku, s.pname, s.specs, s.img_url, s.wty, s.imei,
                              s.imp, s.exp, s.stk, s.thr);

COMMIT;