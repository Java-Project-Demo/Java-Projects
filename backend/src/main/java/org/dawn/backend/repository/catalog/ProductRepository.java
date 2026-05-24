package org.dawn.backend.repository.catalog;

import jakarta.transaction.Transactional;
import org.dawn.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Long countByIsDeleted(Boolean isDeleted);

    Optional<Product> findBySku(String sku);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.currentStock <= p.minThreshold")
    Long countLowStock();

    @Query("SELECT SUM(p.priceImport * p.currentStock) FROM Product p")
    BigDecimal getTotalInventoryValue();

    @Query("SELECT p FROM Product p WHERE p.currentStock <= p.minThreshold")
    List<Product> findLowStockProducts();

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.currentStock = p.currentStock + :qty WHERE p.id = :id ")
    void addStock(@Param("id") Long id, @Param("qty") Integer qty);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.currentStock = p.currentStock - :qty WHERE p.id = :id")
    int subtractStock(@Param("id") Long id, @Param("qty") Integer qty);

}
