package org.dawn.backend.repository;

import org.dawn.backend.entity.OrderItem;
import org.dawn.backend.repository.base.BaseRepository;

import java.util.List;

public interface OrderItemRepository extends BaseRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    long getTotalQuantityByOrderId(Long orderId);
}
