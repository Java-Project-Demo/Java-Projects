package org.dawn.backend.dto.catalog;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.system.ActiveStatus;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProductUpdateRequest {

    private String sku;

    private Long categoryId;

    private String name;

    private BigDecimal priceImport;

    private String imageUrl;

    private BigDecimal priceExport;

    private Boolean hasImei;

    private Integer currentStock;

    private Long warrantyPeriod;

    private Integer minThreshold;

    private String specifications;

    private ActiveStatus status;

    private Boolean isDeleted;
}
