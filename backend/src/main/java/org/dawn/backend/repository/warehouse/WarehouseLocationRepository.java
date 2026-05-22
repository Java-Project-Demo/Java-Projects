package org.dawn.backend.repository.warehouse;

import org.dawn.backend.entity.WarehouseLocation;
import org.dawn.backend.repository.base.BaseRepository;

import java.util.List;

public interface WarehouseLocationRepository extends BaseRepository<WarehouseLocation, Long> {
    void saveAll(List<WarehouseLocation> entities);

    List<WarehouseLocation> findByWarehouseId(Long warehouseId);

    List<WarehouseLocation> findEmptyLocations();

    List<WarehouseLocation> findAvailableLocationsByWarehouseId(Long warehouseId, Long productId);

    long countAvailableItemsByLocationId(Long locationId);

    boolean hasOtherProductInLocation(Long locationId, Long productId);
}
