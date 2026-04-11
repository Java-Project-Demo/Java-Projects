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

    private final StockMovementRepository movementRepository;

    private final ProductItemRepository itemRepository;

    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> data = new HashMap<>();

        BigDecimal inventoryValue = productRepository
                .findAll()
                .stream()
                .map(p -> p
                        .getPriceImport()
                        .multiply(BigDecimal.valueOf(p.getCurrentStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        data.put("totalInventoryValue", inventoryValue);
        data.put("totalProducts", productRepository.count());

        Long lowStockCount = productRepository.findAll()
                .stream()
                .filter(p -> p.getCurrentStock() <= p.getMinThreshold())
                .count();
        data.put("lowStockCount", lowStockCount);

        data.put("pendingOrders", orderRepository.countByStatus(OrderStatus.PENDING));

        return data;
    }

}
