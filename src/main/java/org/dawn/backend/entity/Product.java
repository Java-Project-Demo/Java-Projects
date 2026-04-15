package org.dawn.backend.entity;


import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.ProductStatus;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class Product extends AbstractMappedEntity {

    private Long id;

    private String sku;

    private String name;

    private BigDecimal priceImport;

    private BigDecimal priceExport;

    @Builder.Default
    private Integer currentStock = 0;

    @Builder.Default
    private Integer minThreshold = 5;

    private ProductStatus status = ProductStatus.ACTIVE;
}
