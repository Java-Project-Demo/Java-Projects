package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(exclude = "warehouse")
@ToString(exclude = "warehouse")
public class WarehouseLocation {
    private Long id;

    private Long warehouseId;

    private String zoneName;

    private String rowNum;

    private String shelfNum;

    private String binNum;

    private Warehouse warehouse;
}
