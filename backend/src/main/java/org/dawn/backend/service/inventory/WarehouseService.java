package org.dawn.backend.service.inventory;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.Loggable;
import org.dawn.backend.constant.inventory.MovementType;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.inventory.WarehouseLocationResponse;
import org.dawn.backend.dto.inventory.WarehouseMappingHelper;
import org.dawn.backend.dto.inventory.WarehouseRequest;
import org.dawn.backend.dto.inventory.WarehouseResponse;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.entity.Warehouse;
import org.dawn.backend.entity.WarehouseLocation;
import org.dawn.backend.exception.ApiException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.warehouse.WarehouseLocationRepository;
import org.dawn.backend.repository.warehouse.WarehouseRepository;
import org.dawn.backend.utils.SecurityContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
@Service
public class WarehouseService {
    private final WarehouseRepository warehouseRepository;
    private final WarehouseLocationRepository locationRepository;
    private final StockService stockService;
    private final ProductItemRepository itemRepository;

    @Loggable(
            action = LogConstant.Action.RETURN_ORDER,
            entity = LogConstant.Entity.PRODUCT_ITEM,
            entityId = "#result?.id",
            message = "'Create new warehouse:' + #saved.name"
    )
    @Transactional
    public WarehouseResponse createWarehouse(WarehouseRequest warehouse) {

        Warehouse saved = warehouseRepository.save(WarehouseMappingHelper.map(warehouse));

        return WarehouseMappingHelper.map(saved);

    }

    @Transactional
    public void setupLocLayout(Long warehouseId, String zone, String row, int shelfCount, int binCount) {
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
    }

    @Transactional
    public void moveItem(String imei, Long targetLocId) {

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
            throw new ApiException(MessageFormat.format(Message.Exception.ITEM_ALREADY_AT_LOCATION, targetLocId));
        }
        item.setLocationId(targetLocId);
        itemRepository.save(item);

        stockService.saveMovement(
                item.getProductId(),
                MovementType.ADJUST,
                "LOCATION_TRANSFER",
                1,
                null,
                SecurityContext.getCurrentUserId(),
                "Transform location from " + oldLocId + " to " + targetLocId);
    }

    public List<WarehouseResponse> getPhysicalMap() {
        return warehouseRepository
                .findAll()
                .stream()
                .map(WarehouseMappingHelper::map)
                .toList();
    }

    public List<WarehouseLocationResponse> getAvailableBins(Long warehouseId, Long productId) {
        return locationRepository
                .findAvailableLocationsByWarehouseId(warehouseId, productId)
                .stream()
                .map(WarehouseMappingHelper::mapItem)
                .toList();
    }

}
