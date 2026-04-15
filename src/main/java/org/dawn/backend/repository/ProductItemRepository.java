package org.dawn.backend.repository;

import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.repository.base.BaseRepository;

import java.util.List;
import java.util.Optional;

public interface ProductItemRepository extends BaseRepository<ProductItem, Long> {
    Optional<ProductItem> findByImei(String imei);

    boolean existsByImei(String imei);

    List<ProductItem> findByProductIdAndStatus(Long productId, String status);
}
