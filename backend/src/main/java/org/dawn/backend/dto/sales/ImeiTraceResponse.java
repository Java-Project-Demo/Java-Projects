package org.dawn.backend.dto.sales;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.catalog.ItemStatus;
import org.dawn.backend.constant.sales.PaymentMethod;
import org.dawn.backend.dto.inventory.WarehouseLocationResponse;
import org.dawn.backend.dto.warranty.WarrantyResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ImeiTraceResponse {
    private ItemInfoResponse itemInfo;
    private ProductInfoResponse productInfo;
    private SaleInfoResponse saleInfo;
    private WarehouseLocationResponse locationInfo;
    private List<WarrantyResponse> warrantyHistory;


    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemInfoResponse {
        private String imei;
        private ItemStatus status;
        private Instant importDate;
    }


    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductInfoResponse {
        private String sku;
        private String name;
        private Long warrantyPeriod;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaleInfoResponse {
        @Data
        @SuperBuilder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class CustomerInfo {
            private String fullName;
            private String phoneNumber;
        }

        private CustomerInfo customer;
        private Instant saleDate;
        private BigDecimal salePrice;
        private PaymentMethod paymentMethod;
    }
}
