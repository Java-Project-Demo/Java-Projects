package org.dawn.backend.constant.system;

public class Message {

    public static class Exception {
        //     Refresh Token
        public static final String REFRESH_TOKEN_NOT_FOUND = "Refresh token not found";
        public static final String REFRESH_TOKEN_EXPIRED = "Refresh token was expired, Please make a new log in request";
        //     User
        public static final String USER_NOT_FOUND = "User not found";
        public static final String EMAIL_NOT_FOUND = "Email not found";
        public static final String USERNAME_EXISTED = "Username already exists";
        public static final String USERNAME_NOT_FOUND = "Username not found";
        public static final String PASSWORD_NOT_MATCH = "Password not match";
        //     Role
        public static final String ROLE_NOT_FOUND = "Role not found";
        public static final String PERMISSION_DENIED = "You don't have permission";
        //     Supplier
        public static final String SUPPLIER_NOT_FOUND = "Supplier not found";
        public static final String SUPPLIER_EXISTED = "Supplier existed";
        //     Category
        public static final String CATEGORY_NOT_FOUND = "Category not found";
        public static final String CATEGORY_EXISTED = "Category existed";
        //     Product
        public static final String PRODUCT_NOT_FOUND = "Product not found";
        public static final String PRODUCT_EXISTED = "Product existed";
        //     Product Item
        public static final String PRODUCT_ITEM_NOT_FOUND = "Product item not found";
        public static final String PRODUCT_ITEM_EXISTED = "Product item existed";

        //     Order
        public static final String ORDER_NOT_FOUND = "Order not found";
        public static final String ORDER_EXISTED = "Order existed";

        //     Customer
        public static final String CUSTOMER_NOT_FOUND = "Customer not found";
        public static final String CUSTOMER_EXISTED = "Customer existed";
        //     Warranty
        public static final String WARRANTY_NOT_FOUND = "Warranty not found";
        public static final String WARRANTY_EXISTED = "Warranty existed";
    }
}
