package org.dawn.backend.dto.inventory;

import org.dawn.backend.entity.Warehouse;
import org.dawn.backend.entity.WarehouseLocation;

public interface WarehouseMappingHelper {
    static Warehouse map(WarehouseRequest req) {
        return Warehouse.builder()
                .name(req.getName())
                .address(req.getAddress())
                .build();
    }

    static WarehouseResponse map(Warehouse req) {
        return WarehouseResponse.builder()
                .id(req.getId())
                .name(req.getName())
                .address(req.getAddress())
                .locations(req
                        .getLocations()
                        .stream()
                        .map(WarehouseMappingHelper::mapItem)
                        .toList())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }

    static WarehouseLocationResponse mapItem(WarehouseLocation item) {
        return WarehouseLocationResponse
                .builder()
                .zoneName(item.getZoneName())
                .rowNum(item.getRowNum())
                .shelfNum(item.getShelfNum())
                .binNum(item.getBinNum())
                .build();
    }
}
