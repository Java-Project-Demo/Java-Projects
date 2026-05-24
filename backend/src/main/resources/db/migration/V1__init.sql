CREATE TABLE roles
(
    id          BIGSERIAL,
    name        VARCHAR(50)                           NOT NULL,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uk_roles_name UNIQUE (name)
);

CREATE TABLE users
(
    id                BIGSERIAL,
    username          VARCHAR(100)                          NOT NULL,
    full_name         VARCHAR(255),
    password          VARCHAR(255)                          NOT NULL,
    gender            SMALLINT,
    date_of_birth     DATE,
    phone_number      VARCHAR(20),
    email             VARCHAR(255),
    status            VARCHAR(20) DEFAULT 'ACTIVE',
    is_password_reset SMALLINT    DEFAULT 0                 NOT NULL,
    role_id           BIGINT                                NOT NULL,
    is_deleted        SMALLINT    DEFAULT 0                 NOT NULL,
    last_login        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_phone UNIQUE (phone_number),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id),
    CONSTRAINT ck_users_is_deleted CHECK (is_deleted IN (0, 1)),
    CONSTRAINT ck_users_gender CHECK (gender IN (0, 1, 2))
);

CREATE TABLE suppliers
(
    id             BIGSERIAL,
    name           VARCHAR(255)                          NOT NULL,
    contact_person VARCHAR(100),
    phone_number   VARCHAR(20),
    email          VARCHAR(255),
    address        VARCHAR(500),
    tax_code       VARCHAR(50),
    status         VARCHAR(20) DEFAULT 'ACTIVE',
    is_deleted     SMALLINT    DEFAULT 0                 NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_suppliers PRIMARY KEY (id),
    CONSTRAINT uk_suppliers_name UNIQUE (name),
    CONSTRAINT ck_suppliers_is_deleted CHECK (is_deleted IN (0, 1)),
    CONSTRAINT ck_suppliers_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE categories
(
    id          BIGSERIAL,
    name        VARCHAR(100)                          NOT NULL,
    description VARCHAR(255),
    is_deleted  SMALLINT    DEFAULT 0                 NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_categories PRIMARY KEY (id),
    CONSTRAINT uk_categories_name UNIQUE (name),
    CONSTRAINT ck_categories_is_deleted CHECK (is_deleted IN (0, 1))
);

CREATE TABLE customers
(
    id           BIGSERIAL,
    phone_number VARCHAR(20)                           NOT NULL,
    full_name    VARCHAR(255)                          NOT NULL,
    email        VARCHAR(255),
    address      VARCHAR(500),
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_customers PRIMARY KEY (id),
    CONSTRAINT uk_customers_phone UNIQUE (phone_number),
    CONSTRAINT uk_customers_email UNIQUE (email)
);

CREATE TABLE products
(
    id               BIGSERIAL,
    category_id      BIGINT                                   NOT NULL,
    sku              VARCHAR(50)                              NOT NULL,
    name             VARCHAR(255),
    image_url        VARCHAR(500),
    specifications   TEXT,
    warranty_period  SMALLINT       DEFAULT 12,
    has_imei         SMALLINT       DEFAULT 1,
    price_import_std NUMERIC(19, 2) DEFAULT 0,
    price_export_std NUMERIC(19, 2) DEFAULT 0,
    current_stock    INTEGER        DEFAULT 0                 NOT NULL,
    min_threshold    INTEGER        DEFAULT 5,
    status           VARCHAR(20)    DEFAULT 'ACTIVE',
    is_deleted       SMALLINT       DEFAULT 0                 NOT NULL,
    created_at       TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at       TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_products PRIMARY KEY (id),
    CONSTRAINT uk_products_sku UNIQUE (sku),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT ck_products_is_deleted CHECK (is_deleted IN (0, 1)),
    CONSTRAINT ck_products_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE warehouses
(
    id         BIGSERIAL,
    name       VARCHAR(100)                          NOT NULL,
    address    VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_warehouses PRIMARY KEY (id)
);

CREATE TABLE warehouse_locations
(
    id           BIGSERIAL,
    warehouse_id BIGINT             NOT NULL,
    zone_name    VARCHAR(50),
    row_num      VARCHAR(20),
    shelf_num    VARCHAR(20),
    bin_num      VARCHAR(20),
    capacity     INTEGER DEFAULT 20 NOT NULL,

    CONSTRAINT pk_warehouse_locations PRIMARY KEY (id),
    CONSTRAINT fk_loc_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT uk_location_coords UNIQUE (warehouse_id, zone_name, row_num, shelf_num, bin_num)
);

CREATE TABLE orders
(
    id             BIGSERIAL,
    sale_id        BIGINT                                   NOT NULL,
    customer_id    BIGINT                                   NOT NULL,
    total_amount   NUMERIC(19, 2) DEFAULT 0,
    payment_method VARCHAR(50),
    status         VARCHAR(20)    DEFAULT 'PENDING',
    created_at     TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at     TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_orders PRIMARY KEY (id),
    CONSTRAINT fk_orders_user_id FOREIGN KEY (sale_id) REFERENCES users (id),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT ck_orders_status CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELED', 'RETURNED'))
);

CREATE TABLE product_items
(
    id                   BIGSERIAL,
    product_id           BIGINT      NOT NULL,
    location_id          BIGINT,
    imei                 VARCHAR(50) NOT NULL,
    cost_price           NUMERIC(19, 2) DEFAULT 0,
    supplier_id          BIGINT,
    condition            VARCHAR(50)    DEFAULT 'NEW',
    status               VARCHAR(20)    DEFAULT 'AVAILABLE',
    order_id             BIGINT,
    warranty_expiry_date TIMESTAMPTZ,
    import_date          TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP,
    sold_date            TIMESTAMPTZ,

    CONSTRAINT pk_product_items PRIMARY KEY (id),
    CONSTRAINT uk_product_items_imei UNIQUE (imei),
    CONSTRAINT fk_items_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
    CONSTRAINT fk_items_prod_id FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_items_order_id FOREIGN KEY (order_id) REFERENCES orders (id),
    CONSTRAINT fk_items_location FOREIGN KEY (location_id) REFERENCES warehouse_locations (id),
    CONSTRAINT ck_items_status CHECK (status IN ('AVAILABLE', 'SOLD', 'DAMAGED', 'RETURNED'))
);

CREATE TABLE order_items
(
    id         BIGSERIAL,
    order_id   BIGINT         NOT NULL,
    product_id BIGINT         NOT NULL,
    quantity   INTEGER        NOT NULL,
    unit_price NUMERIC(19, 2) NOT NULL,

    CONSTRAINT pk_order_items PRIMARY KEY (id),
    CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id),
    CONSTRAINT fk_items_prod FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE refresh_tokens
(
    id          BIGSERIAL,
    user_id     BIGINT       NOT NULL,
    token       VARCHAR(500) NOT NULL,
    expiry_date TIMESTAMPTZ  NOT NULL,

    CONSTRAINT pk_refresh_token PRIMARY KEY (id),
    CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE audit_logs
(
    id          BIGSERIAL,
    user_id     BIGINT,
    username    VARCHAR(100),
    action      VARCHAR(100),
    entity_name VARCHAR(100),
    entity_id   VARCHAR(100),
    status      VARCHAR(50),
    details     TEXT,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_audit_logs PRIMARY KEY (id),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE stock_movements
(
    id           BIGSERIAL,
    product_id   BIGINT                                NOT NULL,
    type         VARCHAR(20)                           NOT NULL,
    action_type  VARCHAR(50)                           NOT NULL,
    quantity     INTEGER                               NOT NULL,
    supplier_id  BIGINT,
    reference_id BIGINT,
    created_by   BIGINT                                NOT NULL,
    note         VARCHAR(500),
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_stock_movements PRIMARY KEY (id),
    CONSTRAINT fk_move_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
    CONSTRAINT fk_move_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT ck_move_type CHECK (type IN ('IMPORT', 'EXPORT', 'ADJUST'))
);

CREATE TABLE warranty_claims
(
    id                BIGSERIAL,
    product_item_id   BIGINT,
    customer_id       BIGINT NOT NULL,
    created_by        BIGINT NOT NULL,
    issue_description TEXT,
    status            VARCHAR(50) DEFAULT 'RECEIVED',
    received_date     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    return_date       TIMESTAMPTZ,

    CONSTRAINT pk_warranty_claims PRIMARY KEY (id),
    CONSTRAINT fk_warranty_item FOREIGN KEY (product_item_id) REFERENCES product_items (id),
    CONSTRAINT fk_warranty_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT fk_warranty_staff FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT ck_warranty_status CHECK (status IN ('RECEIVED', 'FIXING', 'FIXED', 'RETURNED', 'UNFIXABLE'))
);

CREATE TABLE inventory_sessions
(
    id           BIGSERIAL,
    warehouse_id BIGINT                                NOT NULL,
    created_by   BIGINT                                NOT NULL,
    status       VARCHAR(20) DEFAULT 'IN_PROGRESS',
    start_date   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    end_date     TIMESTAMPTZ,

    CONSTRAINT pk_inventory_sessions PRIMARY KEY (id),
    CONSTRAINT fk_inv_session_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
    CONSTRAINT fk_inventory_user FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT ck_inventory_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED'))
);

CREATE INDEX idx_inv_sessions_warehouse ON inventory_sessions (warehouse_id);

CREATE TABLE inventory_details
(
    id            BIGSERIAL,
    session_id    BIGINT,
    imei          VARCHAR(50),
    expected_loc  BIGINT,
    actual_loc    BIGINT,
    record_status VARCHAR(20),
    note          VARCHAR(255),

    CONSTRAINT pk_inventory_details PRIMARY KEY (id),
    CONSTRAINT fk_inv_det_session FOREIGN KEY (session_id) REFERENCES inventory_sessions (id),
    CONSTRAINT fk_inv_det_expected FOREIGN KEY (expected_loc) REFERENCES warehouse_locations (id),
    CONSTRAINT fk_inv_det_actual FOREIGN KEY (actual_loc) REFERENCES warehouse_locations (id),
    CONSTRAINT ck_record_status CHECK (record_status IN ('MATCH', 'MISMATCH', 'MISSING', 'EXTRA'))
);

CREATE TABLE password_reset_tokens
(
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT                NOT NULL,
    token       VARCHAR(255)          NOT NULL UNIQUE,
    expiry_date TIMESTAMPTZ           NOT NULL,
    used        SMALLINT    DEFAULT 0 NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users (id)
);