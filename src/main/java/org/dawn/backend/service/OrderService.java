package org.dawn.backend.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.constant.*;
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

    private final AuditLogService auditLogService;

    public Order create(OrderRequest req) {

        UserPrincipal currentUser = SecurityContext.get();
        Long saleId = (currentUser != null) ? currentUser.id() : null;

        Order order = Order.builder()
                .saleId(saleId)
                .customerName(req.getCustomerName())
                .customerPhone(req.getCustomerPhone())
                .totalAmount(BigDecimal.ZERO)
                .build();

        Order saveOrder = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;
        for (CartItemRequest item : req.getItems()) {
            Product product = productRepository
                    .findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));
            log.info("Product find: {}", product.getId());

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
            total = total
                    .add(product.getPriceExport()
                            .multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        saveOrder.setTotalAmount(total);
        auditLogService.saveLog(
                LogConstant.Action.CREATE_ORDER,
                LogConstant.Entity.ORDER,
                saveOrder.getId().toString(),
                LogConstant.Status.SUCCESS,
                "Sale created order");
        return orderRepository.save(saveOrder);
    }


    public Order cancelOrder(Long orderId) {
        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException();
        }

        order.setStatus(OrderStatus.CANCELED);
        auditLogService.saveLog(
                LogConstant.Action.CANCEL_ORDER,
                LogConstant.Entity.ORDER,
                order.getId().toString(),
                LogConstant.Status.SUCCESS,
                "User cancel order");
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
        auditLogService.saveLog(
                LogConstant.Action.RETURN_ORDER,
                LogConstant.Entity.ORDER,
                order.getId().toString(),
                LogConstant.Status.SUCCESS,
                "User return order");
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
