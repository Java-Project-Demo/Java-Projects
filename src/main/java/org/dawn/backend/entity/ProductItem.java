package org.dawn.backend.entity;


import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.ItemStatus;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(exclude = "product")
public class ProductItem {

    private Long id;

    private Long productId;

    private String imei;

    private BigDecimal costPrice;

    private String supplierName;

    private String condition;

    private ItemStatus status = ItemStatus.AVAILABLE;

    private Long orderId;

    private Instant warrantyExpiryDate;

    @Builder.Default
    private Instant importDate = Instant.now();

    private Instant soldDate;

    private Product product;
}
