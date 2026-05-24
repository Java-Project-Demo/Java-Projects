package org.dawn.backend.repository.warehouse;

import org.dawn.backend.entity.WarehouseLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarehouseLocationRepository extends JpaRepository<WarehouseLocation, Long> {

    List<WarehouseLocation> findByWarehouseId(Long warehouseId);

    @Query(value = """
            SELECT * FROM warehouse_locations
            WHERE id NOT IN (
              SELECT localion_id FROM product_items
              WHERE status = 'AVAILABLE' AND location_id IS NOT NULL
            )
            ORDER BY id ASC
            """, nativeQuery = true)
    List<WarehouseLocation> findEmptyLocations();

    @Query(value = """
            SELECT wl.* FROM warehouse_locations wl
            WHERE wl.warehouse_id = :warehouseId
            AND wl.id NOT IN(
                SELECT DISTINCT location_id FROM product_items
                WHERE status = 'AVAILABLE'
                AND localtion_id IS NOT NULL
                AND product_id != :productId
            )
            ORDER BY wl.id ASC
            """, nativeQuery = true)
    List<WarehouseLocation> findAvailableLocationsByWarehouseId(@Param("warehouseId") Long warehouseId, @Param("productId") Long productId);

    @Query("SELECT COUNT(pi) FROM ProductItem pi WHERE pi.locationId = :locationId AND pi.status ='AVAILABLE'")
    long countAvailableItemsByLocationId(@Param("locationId") Long locationId);

    @Query("SELECT COUNT(pi) > 0 FROM ProductItem  pi WHERE pi.locationId =:locationId AND pi.status = 'AVAILABLE' AND pi.productId != :productId")
    boolean hasOtherProductInLocation(@Param("locationId") Long locationId, @Param("productId") Long productId);
}
