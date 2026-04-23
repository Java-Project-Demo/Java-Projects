package org.dawn.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.ProductStatus;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProductRequest {

    private String sku;

    private Long categoryId;

    private String name;

    private BigDecimal priceImport;

    private BigDecimal priceExport;

    private Boolean hasImei;

    private Integer currentStock;

    private Long warrantyPeriod;

    private Integer minThreshold;

    private String specifications;

    private ProductStatus status;

    private Boolean isDeleted;
}
