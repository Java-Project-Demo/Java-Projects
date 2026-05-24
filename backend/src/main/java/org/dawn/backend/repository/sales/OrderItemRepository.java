package org.dawn.backend.repository.sales;

import org.dawn.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.orderId = :orderId")
    long getTotalQuantityByOrderId(@Param("orderId") Long orderId);
}
