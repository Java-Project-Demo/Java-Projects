package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(exclude = {"warehouse", "items"})
@ToString(exclude = {"warehouse", "items"})
public class WarehouseLocation {
    private Long id;

    private Long warehouseId;

    private String zoneName;

    private String rowNum;

    private String shelfNum;

    private String binNum;

    private Long capacity;

    private Long currentCount;

    private Warehouse warehouse;

    @Builder.Default
    private List<ProductItem> items = new ArrayList<>();
}
