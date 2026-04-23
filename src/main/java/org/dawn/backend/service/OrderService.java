package org.dawn.backend.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.constant.*;
import org.dawn.backend.dto.request.CartItemRequest;
import org.dawn.backend.dto.request.OrderRequest;
import org.dawn.backend.dto.request.RefundRequest;
import org.dawn.backend.entity.*;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.*;

import java.math.BigDecimal;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;

    private final OrderItemRepository orderItemRepository;

    private final ProductRepository productRepository;

    private final ProductItemRepository itemRepository;

    private final CustomerRepository customerRepository;

    private final WarehouseService warehouseService;

    private final AuditLogService auditLogService;

    public Order create(OrderRequest req) {

        UserPrincipal currentUser = SecurityContext.get();
        Long currentUserId = (currentUser != null) ? currentUser.id() : null;

        Customer customer = customerRepository
                .findByPhoneNumber(req.getCustomerPhone())
                .orElseGet(() -> customerRepository
                        .save(Customer
                                .builder()
                                .phoneNumber(req.getCustomerPhone())
                                .address(req.getCustomerAddress())
                                .fullName(req.getCustomerName())
                                .build()));
        Order order = Order
                .builder()
                .saleId(currentUserId)
                .customerId(customer.getId())
                .totalAmount(BigDecimal.ZERO)
                .paymentMethod(req.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .build();
        Order saveOrder = orderRepository.save(order);
        log.info("Saved order: {}", saveOrder.getId());
        BigDecimal total = BigDecimal.ZERO;

        for (CartItemRequest item : req.getItems()) {
            Product product = productRepository
                    .findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));

            Integer available = orderRepository.getAvailableStock(item.getProductId());
            if (available < item.getQuantity()) {
                throw new RuntimeException("Product " + product.getName() + " not enough available stock");
            }

            orderItemRepository.save(OrderItem
                    .builder()
                    .orderId(saveOrder.getId())
                    .productId(product.getId())
                    .quantity(item.getQuantity())
                    .unitPrice(product.getPriceExport())
                    .build());

            // Solve IMEI if product have manager
            if (product.getHasImei() && item.getSelectImeis() != null) {

                if (item.getSelectImeis().size() != item.getQuantity()) {
                    throw new RuntimeException("IMEI do not match with quantity buy");
                }
                for (String imei : item.getSelectImeis()) {
                    warehouseService.exportByImei(saveOrder.getId(), imei);
                }
            } else if (!product.getHasImei()) {
                // With product don't have IMEI, subtract immediately
                productRepository.subtractStock(product.getId(), item.getQuantity());
                warehouseService.saveMovement(
                        product.getId(),
                        MovementType.EXPORT,
                        "SALE",
                        item.getQuantity(),
                        saveOrder.getId(),
                        currentUserId,
                        "Sold to customer " + customer.getFullName());
            }
            total = total.add(product.getPriceExport().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        saveOrder.setTotalAmount(total);
        warehouseService.checkAndCompleteOrder(saveOrder);

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

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.COMPLETED) {
            throw new RuntimeException("Only cancel order new or complete");
        }

        List<ProductItem> items = itemRepository.findByOrderId(orderId);
        for (ProductItem item : items) {
            item.setStatus(ItemStatus.AVAILABLE);
            item.setOrderId(null);
            item.setSoldDate(null);
            item.setWarrantyExpiryDate(null);
            itemRepository.save(item);
            productRepository.addStock(item.getProductId(), 1);
        }

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        for (OrderItem oi : orderItems) {
            productRepository.findById(oi.getProductId()).ifPresent(p -> {
                if (!p.getHasImei()) {
                    productRepository.addStock(oi.getProductId(), oi.getQuantity());
                }
            });
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


    public void returnOrder(Long orderId, RefundRequest req) {
        if (req.getImeis() == null || req.getImeis().isEmpty()) {
            throw new RuntimeException("Return IMEI list do not empty");
        }


        for (String imei : req.getImeis()) {
            ProductItem item = itemRepository
                    .findByImei(imei)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));
            log.info("Order id: {}", item.getOrderId());
            if (item.getOrderId() == null || !item.getOrderId().equals(orderId)) {
                throw new RuntimeException("Product with IMEI " + imei + " do not belong to order: " + orderId);
            }
            warehouseService.returnProduct(imei, req.getReason());
        }


        auditLogService.saveLog(
                LogConstant.Action.RETURN_ORDER,
                LogConstant.Entity.ORDER,
                orderId.toString(),
                LogConstant.Status.SUCCESS,
                "User return order with IMEI: " + String.join(", ", req.getImeis()) + " . Reason: " + req.getReason());
    }
}
