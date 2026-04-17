package org.dawn.backend.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.constant.ItemStatus;
import org.dawn.backend.constant.Message;
import org.dawn.backend.constant.MovementType;
import org.dawn.backend.constant.OrderStatus;
import org.dawn.backend.dto.request.CartItemRequest;
import org.dawn.backend.dto.request.OrderRequest;
import org.dawn.backend.entity.Order;
import org.dawn.backend.entity.OrderItem;
import org.dawn.backend.entity.Product;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.OrderItemRepository;
import org.dawn.backend.repository.OrderRepository;
import org.dawn.backend.repository.ProductItemRepository;
import org.dawn.backend.repository.ProductRepository;

import java.math.BigDecimal;

@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;

    private final OrderItemRepository orderItemRepository;

    private final ProductRepository productRepository;

    private final ProductItemRepository itemRepository;

    private final WarehouseService warehouseService;

    public Order create(OrderRequest req) {

        UserPrincipal currentUser = SecurityContext.get();
        Long saleId = (currentUser != null) ? currentUser.id() : null;


        Order order = Order.builder()
                .saleId(saleId)
                .customerName(req.getCustomerName())
                .customerPhone(req.getCustomerPhone())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        Order saveOrder = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;

        for (CartItemRequest item : req.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElseThrow();

            Integer available = orderRepository.getAvailableStock(item.getProductId());
            if (available < item.getQuantity()) {
                throw new RuntimeException();
            }

            orderItemRepository.save(OrderItem
                    .builder()
                    .orderId(saveOrder.getId())
                    .productId(product.getId())
                    .quantity(item.getQuantity())
                    .unitPrice(product.getPriceExport())
                    .build());
            total = total.add(product.getPriceExport().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        saveOrder.setTotalAmount(total);
        return orderRepository.save(saveOrder);
    }


    public Order cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException();
        }

        order.setStatus(OrderStatus.CANCELED);
        return orderRepository.save(order);
    }


    public void returnOrder(Long orderId, String imei, String reason) {
        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND));

        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

        item.setStatus(ItemStatus.AVAILABLE);
        item.setOrderId(null);
        item.setSoldDate(null);
        itemRepository.save(item);

        productRepository.addStock(item.getProductId(), 1);

        warehouseService.saveMovement(
                item.getProductId(),
                MovementType.IMPORT,
                "RETURN_IMPORT",
                1,
                orderId,
                SecurityContext.get().id(),
                "Customer return: " + reason
        );
    }
}
