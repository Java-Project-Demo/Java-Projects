package org.dawn.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProductRequest {

    private String sku;

    private String name;

    private BigDecimal priceImport;

    private BigDecimal priceExport;

    private Integer currentStock;

    private Integer minThreshold ;
}
