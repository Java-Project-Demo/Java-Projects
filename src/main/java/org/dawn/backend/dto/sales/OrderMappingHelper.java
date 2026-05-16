package org.dawn.backend.dto.sales;

import org.dawn.backend.entity.Order;
import org.dawn.backend.entity.OrderItem;

import java.util.List;

public interface OrderMappingHelper {
    static OrderResponse map(Order req) {
        return OrderResponse
                .builder()
                .id(req.getId())
                .customerId(req.getCustomerId())
                .customerName(req.getCustomer() != null ? req.getCustomer().getFullName() : null)
                .customerPhone(req.getCustomer() != null ? req.getCustomer().getPhoneNumber() : null)
                .totalAmount(req.getTotalAmount())
                .paymentMethod(req.getPaymentMethod())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .build();
    }

    static OrderResponse mapDetail(Order order, List<OrderItem> items) {
        OrderResponse res = map(order);
        res.setItems(items == null ? List.of() : items.stream().map(OrderMappingHelper::mapItem).toList());
        return res;
    }

    static OrderItemResponse mapItem(OrderItem oi) {
        return OrderItemResponse.builder()
                .id(oi.getId())
                .productId(oi.getProductId())
                .productName(oi.getProduct() != null ? oi.getProduct().getName() : null)
                .productSku(oi.getProduct() != null ? oi.getProduct().getSku() : null)
                .quantity(oi.getQuantity())
                .unitPrice(oi.getUnitPrice())
                .build();
    }
}
