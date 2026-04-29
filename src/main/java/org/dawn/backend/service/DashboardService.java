package org.dawn.backend.service;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.constant.Message;
import org.dawn.backend.constant.OrderStatus;
import org.dawn.backend.constant.WarrantyStatus;
import org.dawn.backend.dto.response.ProductResponse;
import org.dawn.backend.entity.*;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.helper.ProductMappingHelper;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.catalog.ProductRepository;
import org.dawn.backend.repository.sales.CustomerRepository;
import org.dawn.backend.repository.sales.OrderRepository;
import org.dawn.backend.repository.system.AuditLogRepository;
import org.dawn.backend.repository.warranty.WarrantyRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
public class DashboardService {
    private final ProductRepository productRepository;

    private final OrderRepository orderRepository;

    private final ProductItemRepository itemRepository;

    private final AuditLogRepository auditLogRepository;

    private final WarrantyRepository warrantyRepository;

    private final CustomerRepository customerRepository;

    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> data = new HashMap<>();

        data.put("totalInventoryValue", productRepository.getTotalInventoryValue());
        data.put("totalProducts", productRepository.count());
        data.put("lowStockCount", productRepository.countLowStock());
        data.put("pendingOrders", orderRepository.countByStatus(OrderStatus.PENDING));
        data.put("todayRevenue", orderRepository.getTodayRevenue());
        data.put("todayProfit", orderRepository.getTodayGrossProfit());
        data.put("activeWarrantyClaims", warrantyRepository.countByStatusNot(WarrantyStatus.RETURNED));
        data.put("recentActivities", auditLogRepository.findTop5OrderByCreatedAtDesc());
        return data;
    }

    public List<ProductResponse> getLowStockAlerts() {
        return productRepository
                .findLowStockProducts()
                .stream()
                .map(ProductMappingHelper::map)
                .toList();
    }


    public Map<String, Object> traceImei(String imei) {
        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

        Product product = productRepository
                .findById(item.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));

        Map<String, Object> saleInfo = new HashMap<>();
        if (item.getOrderId() != null) {
            Order order = orderRepository.findById(item.getOrderId()).orElse(null);
            if (order != null) {
                saleInfo.put("customer", customerRepository.findById(order.getCustomerId()).orElse(null));
                saleInfo.put("saleDate", order.getCreatedAt());
                saleInfo.put("salePrice", order.getTotalAmount());
                saleInfo.put("paymentMethod", order.getPaymentMethod());
            }
        }

        List<Warranty> warranties = warrantyRepository.findByProductItemId(item.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("itemInfo", item);
        result.put("productInfo", product);
        result.put("saleInfo", saleInfo);
        result.put("warrantyHistory", warranties);
        return result;
    }

}
