package org.dawn.backend.constant.system;

public class Message {

    public static class Exception {
        //     Auth
        public static final String INVALID_PASSWORD = "Invalid Password";
        public static final String INVALID_TOKEN = "Invalid Token";
        public static final String TOKEN_INVALID_OR_EXPIRED = "Token was invalid or expired";
        public static final String TOKEN_USED = "Token was used";
        public static final String TOKEN_EXPIRED = "Token was expired";
        public static final String CAN_NOT_UPDATE_YOURSELF = "You can not update yourself";
        public static final String SESSION_NOT_FOUND = "Session Not Found";
        public static final String PRODUCT_NOT_MANAGED_BY_IMEI = "This product is not managed by IMEI code";
        public static final String IMEI_LIST_EMPTY = "IMEI list must not be empty";
        public static final String COST_PRICE_INVALID = "Cost price must be greater than 0";
        public static final String WAREHOUSE_LOCATION_NOT_FOUND = "Warehouse location not found: {0}";
        public static final String SUPPLIER_NOT_FOUND_WITH_ID = "Supplier not found: {0}";
        public static final String ITEM_IMEI_ALREADY_EXISTS = "ITEM {0} already exists";
        public static final String ORDER_STATUS_NOT_ALLOWED_EXPORT = "Only orders with PENDING or COMPLETED status can be exported";
        public static final String ITEM_NOT_IN_ORDER = "ITEM {0} does not belong to the product list in this order";
        public static final String PRODUCT_EXPORT_ENOUGH = "This product has been exported in sufficient quantity for this order";
        public static final String ITEM_STATUS_CONFLICT = "Item status conflict (Current status: {0})";
        public static final String TARGET_LOCATION_NOT_FOUND = "Target location {0} does not exist";
        public static final String ITEM_ALREADY_AT_LOCATION = "Item is already at location {0}";
        public static final String QUANTITY_INVALID = "Quantity must be greater than 0";
        public static final String INSUFFICIENT_STOCK = "Product {0} does not have enough available stock";
        public static final String IMEI_SELECTION_REQUIRED = "Product {0} requires IMEI selection";
        public static final String IMEI_COUNT_MISMATCH = "IMEI count must match quantity for product {0}";
        public static final String RETURN_IMEI_LIST_EMPTY = "Return IMEI list cannot be empty";
        public static final String CANCEL_ORDER_STATUS_INVALID = "Only orders with PENDING or COMPLETED status can be canceled";
        public static final String IMEI_NOT_BELONG_TO_ORDER = "Product with IMEI {0} does not belong to order: {1}";
        public static final String IMAGE_UPLOAD_FAILED = "Image upload failed";
        public static final String PRODUCT_NOT_SOLD = "This product is not active (not sold yet)";
        public static final String WARRANTY_EXPIRED = "This product warranty expired on {0}";
        public static final String ORDER_NOT_FOUND_FOR_PRODUCT = "Cannot find order for product: {0}";
        public static final String WARRANTY_TICKET_NOT_FOUND = "Cannot find warranty ticket";
        public static final String BATCH_SAVE_ERROR = "Error saved batch";
        public static final String METHOD_NOT_IMPLEMENTED = "This method is not deployed in this repo";
        public static final String COULD_NOT_READ_BODY = "Could not read request body";
        public static final String UNAUTHORIZED = "401 Unauthorized";
        public static final String FORBIDDEN = "403 Forbidden";
        public static final String APPLICATION_START_FAILED = "Application failed to start";
        public static final String MISSING_RESOURCE_NAME = "Missing resource name";
        public static final String CONTROLLER_NOT_FOUND = "Controller not found";
        public static final String ENDPOINT_NOT_FOUND = "API Endpoint not found";
        public static final String EMAIL_SENDING_FAILED = "Could not send email. Please contact administrator.";
        public static final String LOCATION_NOT_FOUND = "Location not found";
        public static final String LOCATION_HAS_OTHER_PRODUCT = "Location {0} already contains a different product";
        public static final String BIN_CAPACITY_EXCEEDED = "Bin only has {0} slot(s) left, but you are importing {1} IMEI(s)";
        //     Refresh Token
        public static final String REFRESH_TOKEN_NOT_FOUND = "Refresh token not found";
        public static final String REFRESH_TOKEN_EXPIRED = "Refresh token was expired, Please make a new log in request";
        //     User
        public static final String USER_NOT_FOUND = "User not found";
        public static final String EMAIL_NOT_FOUND = "Email not found";
        public static final String USERNAME_EXISTED = "Username already exists";
        public static final String USERNAME_NOT_FOUND = "Username not found";
        public static final String EMAIL_NOT_EMPTY = "Email address cannot be empty";
        public static final String PASSWORD_NOT_MATCH = "Password not match";
        public static final String PASSWORD_TOO_SHORT = "Password must be at least 6 characters";
        public static final String USER_INACTIVE = "Tài khoản đã bị khoá hoặc chưa được kích hoạt";
        public static final String CAN_NOT_CHANGE_OWN_ROLE = "Bạn không thể tự đổi vai trò của chính mình";
        public static final String CAN_NOT_ASSIGN_ADMIN_ROLE = "Không thể gán vai trò Quản trị viên qua API này";
        public static final String EMAIL_ALREADY_USED = "Email đã được sử dụng bởi tài khoản khác";
        public static final String EMAIL_INVALID_FORMAT = "Email không đúng định dạng";
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
