package org.dawn.backend.service;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.constant.OrderStatus;
import org.dawn.backend.repository.OrderRepository;
import org.dawn.backend.repository.ProductItemRepository;
import org.dawn.backend.repository.ProductRepository;
import org.dawn.backend.repository.StockMovementRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final ProductRepository productRepository;

    private final OrderRepository orderRepository;

    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> data = new HashMap<>();

        data.put("totalInventoryValue", productRepository.getTotalInventoryValue());
        data.put("totalProducts", productRepository.count());
        data.put("lowStockCount", productRepository.countLowStock());
        data.put("pendingOrders", orderRepository.countByStatus(OrderStatus.PENDING));

        return data;
    }

}
