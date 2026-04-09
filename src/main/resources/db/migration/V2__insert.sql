MERGE INTO roles t
    USING (SELECT 'ADMIN' as r_name, 'System Administrator' as r_desc
           FROM dual
           UNION ALL
           SELECT 'SALES' as r_name, 'Sales Department' as r_desc
           FROM dual
           UNION ALL
           SELECT 'STOCK' as r_name, 'Stock/Warehouse Management' as r_desc
           FROM dual) s
    ON (t.name = s.r_name)
    WHEN MATCHED THEN
        UPDATE SET t.description = s.r_desc,
            t.updated_at = CURRENT_TIMESTAMP
    WHEN NOT MATCHED THEN
        INSERT (name, description, created_at, updated_at)
            VALUES (S.r_name, S.r_desc, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;