CREATE TABLE password_reset_tokens (
    id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       NUMBER        NOT NULL,
    token         VARCHAR2(255) NOT NULL UNIQUE,
    expiry_date   TIMESTAMP     NOT NULL,
    used          NUMBER(1)     DEFAULT 0 NOT NULL,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id)
);
