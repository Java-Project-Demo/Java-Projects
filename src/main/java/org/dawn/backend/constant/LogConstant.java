package org.dawn.backend.constant;

public class LogConstant {
    // Action
    public static class Action {
        // Auth
        public static final String LOGIN = "LOGIN";
        public static final String LOGOUT = "LOGOUT";
        public static final String REFRESH_TOKEN = "REFRESH_TOKEN";

        // User
        public static final String CREATE_USER = "CREATE_USER";
        public static final String UPDATE_USER = "UPDATE_USER";
        public static final String DELETE_USER = "DELETE_USER";
        public static final String CHANGE_PASSWORD = "CHANGE_PASSWORD";
        public static final String RESET_PASSWORD = "RESET_PASSWORD";

        // Warehouse/Product
        public static final String CREATE_PRODUCT = "CREATE_PRODUCT";
        public static final String UPDATE_PRODUCT = "UPDATE_PRODUCT";
        public static final String DELETE_PRODUCT = "DELETE_PRODUCT";
        public static final String IMPORT_STOCK = "IMPORT_STOCK";
        public static final String ADJUST_STOCK = "ADJUST_STOCK";

        // Order
        public static final String CREATE_ORDER = "CREATE_ORDER";
        public static final String CANCEL_ORDER = "CANCEL_ORDER";
        public static final String COMPLETE_ORDER = "COMPLETE_ORDER";
        public static final String RETURN_ORDER = "RETURN_ORDER";
    }

    // Entity
    public static class Entity {
        public static final String AUTH = "AUTH";
        public static final String USER = "USER";
        public static final String PRODUCT = "PRODUCT";
        public static final String PRODUCT_ITEM = "PRODUCT_ITEM";
        public static final String ORDER = "ORDER";
        public static final String AUDIT_LOG = "AUDIT_LOG";
    }

    // Status
    public static class Status {
        public static final String SUCCESS = "SUCCESS"; // Success
        public static final String FAILED = "FAILED"; //  Failed when system or logic error
        public static final String DENIED = "DENIED"; //  403
        public static final String UNAUTHORIZED = "UNAUTHORIZED"; // 401
        public static final String EXPIRED = "EXPIRED"; // Token Expired
    }
}
