package org.dawn.backend.entity;


import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.catalog.ItemStatus;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(exclude = {"supplier", "product", "location"})
@ToString(exclude = {"supplier", "product", "location"})
public class ProductItem {

    private Long id;

    private Long productId;

    private Long locationId;

    private String imei;

    private BigDecimal costPrice;

    private Long supplierId;

    private String condition;

    @Builder.Default
    private ItemStatus status = ItemStatus.AVAILABLE;

    private Long orderId;

    private Instant warrantyExpiryDate;

    @Builder.Default
    private Instant importDate = Instant.now();

    private Instant soldDate;

    private Product product;

    private Supplier supplier;

    private WarehouseLocation location;
}
