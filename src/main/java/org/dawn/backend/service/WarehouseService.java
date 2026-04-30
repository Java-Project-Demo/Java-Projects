package org.dawn.backend.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.constant.LogConstant;
import org.dawn.backend.constant.Message;
import org.dawn.backend.constant.MovementType;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.entity.Warehouse;
import org.dawn.backend.entity.WarehouseLocation;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.warehouse.WarehouseLocationRepository;
import org.dawn.backend.repository.warehouse.WarehouseRepository;

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

    public Warehouse createWarehouse(Warehouse warehouse) {
        return manager.execute(() -> {
            Warehouse saved = warehouseRepository.save(warehouse);

            auditLogService.saveLog(
                    LogConstant.Action.CREATE_WAREHOUSE,
                    LogConstant.Entity.WAREHOUSE,
                    saved.getId().toString(),
                    LogConstant.Status.SUCCESS,
                    "Create new warehouse: " + saved.getName()
            );
            return saved;
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

            Long oldLocId = item.getLocationId();
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

    public List<Warehouse> getPhysicalMap() {
        return warehouseRepository.findAll();
    }

    public List<WarehouseLocation> getAvailableBins(Long warehouseId) {
        return locationRepository.findEmptyLocations();
    }

}
