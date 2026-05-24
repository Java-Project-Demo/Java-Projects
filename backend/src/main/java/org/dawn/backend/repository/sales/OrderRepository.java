package org.dawn.backend.repository.sales;

import org.dawn.backend.constant.sales.OrderStatus;
import org.dawn.backend.entity.AuditLog;
import org.dawn.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByStatusOrderByCreatedAtAsc(OrderStatus status);

    Long countByStatus(OrderStatus status);

    @Query(value = """
            SELECT p.current_stock -
                COALESCE((SELECT SUM(oi.quantity)
                            FROM order_items oi
                            JOIN orders o ON oi.order_id = o.id
                            WHERE oi.product_id = p.id
                            AND o.status ='PENDING'), 0)
            FROM products p
            WHERE p.id = :productId
            """, nativeQuery = true)
    Integer getAvailableStock(@Param("productId") Long productId);

    @Query(value = """
            SELECT SUM(total_amount) FROM orders
            WHERE status = 'COMPLETED' AND created_at::DATE = CURRENT_DATE
            """, nativeQuery = true)
    BigDecimal getTodayRevenue();


    @Query(value = """
            SELECT SUM(oi.unit_price * oi.quantity) - SUM(pi.cost_price)
            FROM order_items oi
            JOIN product_items pi ON oi.order_id = pi.order_id
                        AND oi.product_id = pi.product_id
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status = 'COMPLETED' AND o.created_at::DATE = CURRENT_DATE
            """, nativeQuery = true)
    BigDecimal getTodayGrossProfit();
}
