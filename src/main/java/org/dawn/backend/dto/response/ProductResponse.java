package org.dawn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.ProductStatus;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class ProductResponse extends BaseResponse {
    private Long id;

    private Long categoryId;

    private String sku;

    private String name;

    private BigDecimal priceImport;

    private BigDecimal priceExport;

    private Integer currentStock;

    private Integer minThreshold;

    private ProductStatus status;

    private String specifications;

    private Boolean isDeleted;

    private List<ProductItemResponse> items;
}
