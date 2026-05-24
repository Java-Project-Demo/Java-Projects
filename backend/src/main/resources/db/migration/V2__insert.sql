-- ─── Roles ───────────────────────────────────────────────────────────────────
INSERT INTO roles (name, description)
VALUES ('ADMIN', 'System Administrator'),
       ('SALES', 'Sales Department'),
       ('STOCK', 'Stock/Warehouse Management')
ON CONFLICT (name) DO UPDATE
    SET description = EXCLUDED.description,
        updated_at  = CURRENT_TIMESTAMP;

-- ─── Users (admin, stock, sale) ──────────────────────────────────────────────
INSERT INTO users (username, full_name, email, password, role_id, status, is_password_reset, is_deleted)
VALUES ('admin',
        'System Administrator',
        'admin@system.com',
        '$2a$12$h9ieQ4D6Vztalxf.vqmuNeJIeHgi9XSXZwzzBDJIvpT2CVtdNhTEy', -- "admin"
        (SELECT id FROM roles WHERE name = 'ADMIN'),
        'ACTIVE', 0, 0),

       ('stock',
        'Warehouse Manager',
        'stock@system.com',
        '$2a$12$cTWQAh2OxHcd0aYV07FDEOfs93r8wbNVl9Fge22YaLCF.07U2ZlYK', -- "stock"
        (SELECT id FROM roles WHERE name = 'STOCK'),
        'ACTIVE', 0, 0),

       ('sale',
        'Sales Representative',
        'sale@system.com',
        '$2a$12$U7Ahn7Lz28LcLsH9gJfN/e9Vs.uF0./O5pR8wAyJpw01kb3tPq1Ya', -- "sale"
        (SELECT id FROM roles WHERE name = 'SALES'),
        'ACTIVE', 0, 0)
ON CONFLICT (username) DO NOTHING;