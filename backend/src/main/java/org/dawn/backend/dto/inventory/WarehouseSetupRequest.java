package org.dawn.backend.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class WarehouseSetupRequest {
    private Long warehouseId;
    private String zone;
    private String row;
    private int shelfCount;
    private int binCount;
}
