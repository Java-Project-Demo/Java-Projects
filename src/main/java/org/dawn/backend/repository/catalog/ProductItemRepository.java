package org.dawn.backend.repository.catalog;

import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.repository.base.BaseRepository;

import java.util.List;
import java.util.Optional;

public interface ProductItemRepository extends BaseRepository<ProductItem, Long> {
    Optional<ProductItem> findByImei(String imei);

    List<ProductItem> findByOrderId(Long orderId);

    void saveAll(List<ProductItem> entities);

    long countByOrderId(Long orderId);

    long countByProductIdAndOrderId(Long productId, Long orderId);

    boolean existsByImei(String imei);

    List<ProductItem> findByProductIdAndStatus(Long productId, String status);
}
