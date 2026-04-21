package org.dawn.backend.entity;


import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.ProductStatus;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = "items")
public class Product extends AbstractMappedEntity {

    private Long id;

    private Long categoryId;

    private String sku;

    private String name;

    private String specifications;

    private Long warrantyPeriod;

    private Boolean hasImei;

    private BigDecimal priceImport;

    private BigDecimal priceExport;

    @Builder.Default
    private Integer currentStock = 0;

    @Builder.Default
    private Integer minThreshold = 5;

    private ProductStatus status = ProductStatus.ACTIVE;

    private List<ProductItem> items;

    private Category category;
}
