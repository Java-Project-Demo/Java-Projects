ALTER TABLE inventory_sessions ADD warehouse_id NUMBER(19, 0);

ALTER TABLE inventory_sessions
    ADD CONSTRAINT fk_inv_session_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id);

CREATE INDEX idx_inv_sessions_warehouse ON inventory_sessions (warehouse_id);
