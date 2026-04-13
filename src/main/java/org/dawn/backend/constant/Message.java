package org.dawn.backend.constant;

public class Message {

    public static class Exception {
        //Refresh Token
        public static final String REFRESH_TOKEN_NOT_FOUND = "Refresh token not found";
        public static final String REFRESH_TOKEN_EXPIRED = "Refresh token was expired, Please make a new log in request";
        //    User
        public static final String USER_NOT_FOUND = "User not found";
        public static final String EMAIL_NOT_FOUND = "Email not found";
        public static final String USERNAME_EXISTED = "Username already exists";
        public static final String USERNAME_NOT_FOUND = "Username not found";
        public static final String PASSWORD_NOT_MATCH = "Password not match";
        //    Role
        public static final String ROLE_NOT_FOUND = "Role not found";
        public static final String PERMISSION_DENIED = "You don't have permission";

        //     Product
        public static final String PRODUCT_NOT_FOUND = "Product not found";

        //     Product Item
        public static final String PRODUCT_ITEM_NOT_FOUND = "Product item not found";
    }
}
