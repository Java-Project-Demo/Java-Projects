package org.dawn.backend.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class WarehouseLocationResponse {
    private Long id;

    private Long warehouseId;

    private String zoneName;

    private String rowNum;

    private String shelfNum;

    private String binNum;

    private Long capacity;

    @lombok.Builder.Default
    private List<LocationItemMini> items = new ArrayList<>();
}
