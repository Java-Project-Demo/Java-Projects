package org.dawn.backend.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ImportImeiRequest {
    private Long productId;
    private Long locationId;
    private BigDecimal costPrice;
    private Long supplierId;
    private List<String> imeiList;
}
