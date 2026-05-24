package org.dawn.backend.repository.catalog;

import org.dawn.backend.constant.catalog.ItemStatus;
import org.dawn.backend.entity.ProductItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductItemRepository extends JpaRepository<ProductItem, Long> {
    Optional<ProductItem> findByImei(String imei);

    List<ProductItem> findByOrderId(Long orderId);

    @Query(value = """
                SELECT pi.imei FROM product_items pi
                WHERE pi.status = 'AVAILABLE'
                AND pi.imei NOT IN (
                    SELECT imei FROM inventory_details WHERE session_id = :sessionId
                )
            """, nativeQuery = true)
    List<String> findMissingImeis(@Param("sessionId") Long sessionId);

    @Query(value = """
                SELECT pi.imei FROM product_items pi
                JOIN warehouse_locations wl ON pi.location_id = wl.id
                WHERE pi.status = 'AVAILABLE'
                AND wl.warehouse_id  = :warehouseId
                AND pi.imie NOT IN (
                    SELECT imei FROM inventory_details WHERE session_id = :sessionId
                )
            """, nativeQuery = true)
    List<String> findMissingImeisByWarehouse(@Param("sessionId") Long sessionId, @Param("warehouseId") Long warehouseId);

    @Query(value = "SELECT pi FROM ProductItem pi WHERE pi.status = 'AVAIABLE' AND pi.importDate < :threshold ORDER BY pi.importDate ASC")
    List<ProductItem> findAgingStock(@Param("threshold") Instant threshold);

    long countByOrderId(Long orderId);

    long countByProductIdAndOrderId(Long productId, Long orderId);

    boolean existsByImei(String imei);

    List<ProductItem> findByProductIdAndStatus(Long productId, ItemStatus status);
}
