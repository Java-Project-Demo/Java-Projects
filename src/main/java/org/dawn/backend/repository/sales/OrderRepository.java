package org.dawn.backend.repository.sales;

import org.dawn.backend.constant.OrderStatus;
import org.dawn.backend.entity.Order;
import org.dawn.backend.repository.base.BaseRepository;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends BaseRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);

    List<Order> findByStatusOrderByCreatedAtAsc(OrderStatus status);

    Long countByStatus(OrderStatus status);

    Integer getAvailableStock(Long productId);

    BigDecimal getTodayRevenue();

    BigDecimal getTodayGrossProfit();
}
