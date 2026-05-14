MERGE INTO roles t
    USING (SELECT 'ADMIN' r_name, 'System Administrator' r_desc
           FROM dual
           UNION ALL
           SELECT 'SALES', 'Sales Department'
           FROM dual
           UNION ALL
           SELECT 'STOCK', 'Stock/Warehouse Management'
           FROM dual) s ON (t.name = s.r_name)
    WHEN MATCHED THEN UPDATE SET t.description = s.r_desc, t.updated_at = CURRENT_TIMESTAMP
    WHEN NOT MATCHED THEN INSERT (name, description) VALUES (s.r_name, s.r_desc);

COMMIT;

MERGE INTO users t
    USING (SELECT 'admin'                                                        uname,
                  'System Administrator'                                         fname,
                  'admin@system.com'                                             u_email,
                  '$2a$12$h9ieQ4D6Vztalxf.vqmuNeJIeHgi9XSXZwzzBDJIvpT2CVtdNhTEy' pwd, -- Hash của "admin"
                  'ADMIN'                                                        rname
           FROM dual
           UNION ALL
           SELECT 'stock',
                  'Warehouse Manager',
                  'stock@system.com',
                  '$2a$12$cTWQAh2OxHcd0aYV07FDEOfs93r8wbNVl9Fge22YaLCF.07U2ZlYK' pwd, -- Hash của "stock"
                  'STOCK'
           FROM dual
           UNION ALL
           SELECT 'sale',
                  'Sales Representative',
                  'sale@system.com',
                  '$2a$12$U7Ahn7Lz28LcLsH9gJfN/e9Vs.uF0./O5pR8wAyJpw01kb3tPq1Ya' pwd, -- Hash của "sale"
                  'SALES'
           FROM dual) s ON (t.username = s.uname)
    WHEN NOT MATCHED THEN
        INSERT (username, full_name, email, password, role_id, status, is_password_reset, is_deleted)
            VALUES (s.uname, s.fname, s.u_email, s.pwd, (SELECT id FROM roles WHERE name = s.rname), 'ACTIVE', 0, 0);

COMMIT;