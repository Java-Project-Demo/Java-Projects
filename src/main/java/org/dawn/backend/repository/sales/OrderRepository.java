package org.dawn.backend.repository.sales;

import org.dawn.backend.constant.sales.OrderStatus;
import org.dawn.backend.entity.Order;
import org.dawn.backend.repository.base.BaseRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends BaseRepository<Order, Long> {

    List<Order> search(String status, LocalDateTime startDate, LocalDateTime endDate, int page, int size);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByStatusOrderByCreatedAtAsc(OrderStatus status);

    Long countByStatus(OrderStatus status);

    Integer getAvailableStock(Long productId);

    BigDecimal getTodayRevenue();

    BigDecimal getTodayGrossProfit();
}
