package org.dawn.backend.dto.inventory;

import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.entity.Warehouse;
import org.dawn.backend.entity.WarehouseLocation;

import java.util.List;

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
        List<ProductItem> items = item.getItems();
        return WarehouseLocationResponse
                .builder()
                .id(item.getId())
                .warehouseId(item.getWarehouseId())
                .zoneName(item.getZoneName())
                .rowNum(item.getRowNum())
                .shelfNum(item.getShelfNum())
                .binNum(item.getBinNum())
                .items(items == null
                        ? List.of()
                        : items.stream().map(WarehouseMappingHelper::mapMini).toList())
                .build();
    }

    static LocationItemMini mapMini(ProductItem pi) {
        return LocationItemMini.builder()
                .id(pi.getId())
                .productId(pi.getProductId())
                .productName(pi.getProduct() != null ? pi.getProduct().getName() : null)
                .productSku(pi.getProduct() != null ? pi.getProduct().getSku() : null)
                .imei(pi.getImei())
                .status(pi.getStatus() != null ? pi.getStatus().name() : null)
                .build();
    }
}
