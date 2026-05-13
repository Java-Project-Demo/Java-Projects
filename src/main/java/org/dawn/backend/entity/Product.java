package org.dawn.backend.entity;


import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.system.ActiveStatus;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = {"items", "category"})
@ToString(exclude = {"items", "category"})
public class Product extends AbstractMappedEntity {

    private Long id;

    private Long categoryId;

    private String sku;

    private String name;

    private String imageUrl;

    private String specifications;

    private Long warrantyPeriod;

    private Boolean hasImei;

    private BigDecimal priceImport;

    private BigDecimal priceExport;

    @Builder.Default
    private Integer currentStock = 0;

    @Builder.Default
    private Integer minThreshold = 5;

    @Builder.Default
    private ActiveStatus status = ActiveStatus.INACTIVE;

    @Builder.Default
    private Boolean isDeleted = false;

    @Builder.Default
    private List<ProductItem> items = new ArrayList<>();

    private Category category;
}
