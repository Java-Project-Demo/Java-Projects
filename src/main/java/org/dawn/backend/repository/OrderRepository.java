package org.dawn.backend.repository;

import org.dawn.backend.constant.OrderStatus;
import org.dawn.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);

    Long countByStatus(OrderStatus status);
    
    @Query("""
            SELECT p.currentStock -
                COALESCE((SELECT SUM(oi.quantity)
                    FROM OrderItem oi
                    JOIN Order o ON oi.orderId = o.id
                    WHERE oi.productId = p.id
                    AND o.status = 'PENDING'), 0)
            FROM Product p
            WHERE p.id = :productId
            """)
    Integer getAvailableStock(@Param("productId") Long productId);
}
