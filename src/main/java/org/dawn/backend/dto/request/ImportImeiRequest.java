package org.dawn.backend.dto.request;

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
    private String supplier;
    private List<String> imeiList;
}
