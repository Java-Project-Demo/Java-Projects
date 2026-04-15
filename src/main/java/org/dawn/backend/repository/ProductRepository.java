package org.dawn.backend.repository;

import org.dawn.backend.entity.Product;
import org.dawn.backend.repository.base.BaseRepository;

import java.math.BigDecimal;
import java.util.Optional;


public interface ProductRepository extends BaseRepository<Product, Long> {
    Optional<Product> findBySku(String sku);

    Long countLowStock();

    BigDecimal getTotalInventoryValue();

    void addStock(Long id, Integer qty);

    int subtractStock(Long id, Integer qty);

    Long count();
}
