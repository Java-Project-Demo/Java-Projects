package org.dawn.backend.repository;

import org.dawn.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);


    @Modifying
    @Query("UPDATE Product p SET p.currentStock = p.currentStock + :qty WHERE p.id = :id")
    void addStock(Long id, Integer qty);


    @Modifying
    @Query("UPDATE Product p SET p.currentStock = p.currentStock - :qty WHERE p.id = :id AND p.currentStock >= :qty")
    int subtractStock(Long id, Integer qty);
}
