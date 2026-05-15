package org.dawn.backend.service.inventory;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.constant.inventory.MovementType;
import org.dawn.backend.dto.inventory.WarehouseLocationResponse;
import org.dawn.backend.dto.inventory.WarehouseMappingHelper;
import org.dawn.backend.dto.inventory.WarehouseRequest;
import org.dawn.backend.dto.inventory.WarehouseResponse;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.entity.Warehouse;
import org.dawn.backend.entity.WarehouseLocation;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.warehouse.WarehouseLocationRepository;
import org.dawn.backend.repository.warehouse.WarehouseRepository;
import org.dawn.backend.service.system.AuditLogService;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class WarehouseService {
    private final WarehouseRepository warehouseRepository;
    private final WarehouseLocationRepository locationRepository;
    private final StockService stockService;
    private final AuditLogService auditLogService;
    private final ProductItemRepository itemRepository;
    private final TransactionManager manager;

    public WarehouseResponse createWarehouse(WarehouseRequest warehouse) {
        return manager.execute(() -> {
            Warehouse saved = warehouseRepository.save(WarehouseMappingHelper.map(warehouse));

            auditLogService.saveLog(
                    LogConstant.Action.CREATE_WAREHOUSE,
                    LogConstant.Entity.WAREHOUSE,
                    saved.getId().toString(),
                    LogConstant.Status.SUCCESS,
                    "Create new warehouse: " + saved.getName()
            );
            return WarehouseMappingHelper.map(saved);
        });
    }

    public void setupLocLayout(Long warehouseId, String zone, String row, int shelfCount, int binCount) {
        manager.execute(() -> {
            List<WarehouseLocation> locations = new ArrayList<>();
            for (int s = 1; s <= shelfCount; s++) {
                for (int b = 1; b <= binCount; b++) {
                    locations.add(WarehouseLocation
                            .builder()
                            .warehouseId(warehouseId)
                            .zoneName(zone)
                            .rowNum(row)
                            .shelfNum(String.valueOf(s))
                            .binNum(String.valueOf(b))
                            .build());
                }
            }

            locationRepository.saveAll(locations);
            log.info("Initialize {} for location with row {} - zone {}", (shelfCount * binCount), row, zone);
            return null;
        });
    }

    public void moveItem(String imei, Long targetLocId) {
        manager.execute(() -> {
            ProductItem item = itemRepository
                    .findByImei(imei)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

            // Validate target bin exists
            locationRepository
                    .findById(targetLocId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            MessageFormat.format(Message.Exception.TARGET_LOCATION_NOT_FOUND, targetLocId)
                    ));

            Long oldLocId = item.getLocationId();
            if (targetLocId.equals(oldLocId)) {
                throw new RuntimeException(MessageFormat.format(Message.Exception.ITEM_ALREADY_AT_LOCATION, targetLocId));
            }
            item.setLocationId(targetLocId);
            itemRepository.save(item);

            stockService.saveMovement(
                    item.getProductId(),
                    MovementType.ADJUST,
                    "LOCATION_TRANSFER",
                    1,
                    null,
                    SecurityContext.get().id(),
                    "Transform location from " + oldLocId + " to " + targetLocId);
            return null;
        });
    }

    public List<WarehouseResponse> getPhysicalMap() {
        return warehouseRepository
                .findAll()
                .stream()
                .map(WarehouseMappingHelper::map)
                .toList();
    }

    public List<WarehouseLocationResponse> getAvailableBins(Long warehouseId) {
        return locationRepository
                .findEmptyLocationsByWarehouseId(warehouseId)
                .stream()
                .map(WarehouseMappingHelper::mapItem)
                .toList();
    }

}
