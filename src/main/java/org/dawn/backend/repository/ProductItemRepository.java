package org.dawn.backend.repository;

import org.dawn.backend.entity.ProductItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductItemRepository extends JpaRepository<ProductItem, Long> {
    Optional<ProductItem> findByImei(String imei);

    boolean existsByImei(String imei);

    List<ProductItem> findByProductIdAndStatus(Long productId, String status);
}
