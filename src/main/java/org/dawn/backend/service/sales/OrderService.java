package org.dawn.backend.service.sales;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.constant.catalog.ItemStatus;
import org.dawn.backend.constant.inventory.MovementType;
import org.dawn.backend.constant.sales.OrderStatus;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.sales.CartItemRequest;
import org.dawn.backend.dto.sales.OrderRequest;
import org.dawn.backend.dto.sales.RefundRequest;
import org.dawn.backend.dto.sales.OrderResponse;
import org.dawn.backend.entity.*;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.dto.sales.OrderMappingHelper;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.catalog.ProductRepository;
import org.dawn.backend.repository.sales.CustomerRepository;
import org.dawn.backend.repository.sales.OrderItemRepository;
import org.dawn.backend.repository.sales.OrderRepository;
import org.dawn.backend.service.inventory.StockService;
import org.dawn.backend.service.system.AuditLogService;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ProductItemRepository itemRepository;
    private final CustomerRepository customerRepository;
    private final StockService stockService;
    private final AuditLogService auditLogService;
    private final TransactionManager manager;

    public org.dawn.backend.config.web.response.ResponsePage<OrderResponse> getAll(
            String status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size) {
        List<Order> rows = orderRepository.search(status, startDate, endDate, page, size);
        long total = orderRepository.countSearch(status, startDate, endDate);
        int totalPages = size > 0 ? (int) ((total + size - 1) / size) : 0;
        org.dawn.backend.config.web.response.PageResponse<OrderResponse> pageRes =
                org.dawn.backend.config.web.response.PageResponse.<OrderResponse>builder()
                        .content(rows.stream().map(OrderMappingHelper::map).toList())
                        .totalElements(total)
                        .totalPages(totalPages)
                        .number(page)
                        .size(size)
                        .build();
        return org.dawn.backend.config.web.response.ResponsePage.of(pageRes);
    }

    public OrderResponse getOne(Long id) {
        Order order = orderRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND));
        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        return OrderMappingHelper.mapDetail(order, items);
    }

    public OrderResponse create(OrderRequest req) {
        return manager.execute(() -> {
            UserPrincipal currentUser = SecurityContext.get();
            Long currentUserId = (currentUser != null) ? currentUser.id() : null;

            // Get customer (upsert email/address if user provided new info)
            Customer customer = customerRepository
                    .findByPhoneNumber(req.getCustomerPhone())
                    .map(existing -> {
                        boolean changed = false;
                        if (existing.getEmail() == null && req.getCustomerEmail() != null && !req.getCustomerEmail().isBlank()) {
                            existing.setEmail(req.getCustomerEmail().trim());
                            changed = true;
                        }
                        if (existing.getAddress() == null && req.getCustomerAddress() != null && !req.getCustomerAddress().isBlank()) {
                            existing.setAddress(req.getCustomerAddress().trim());
                            changed = true;
                        }
                        return changed ? customerRepository.save(existing) : existing;
                    })
                    .orElseGet(() -> customerRepository
                            .save(Customer
                                    .builder()
                                    .phoneNumber(req.getCustomerPhone())
                                    .email(req.getCustomerEmail() != null && !req.getCustomerEmail().isBlank() ? req.getCustomerEmail().trim() : null)
                                    .address(req.getCustomerAddress())
                                    .fullName(req.getCustomerName())
                                    .build()));
            // Initialize order with PENDING status
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
                if (item.getQuantity() == null || item.getQuantity() <= 0) {
                    throw new RuntimeException(Message.Exception.QUANTITY_INVALID);
                }

                Product product = productRepository
                        .findById(item.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));
                // Check available stock
                Integer available = orderRepository.getAvailableStock(item.getProductId());
                if (available < item.getQuantity()) {
                    throw new RuntimeException(MessageFormat.format(Message.Exception.INSUFFICIENT_STOCK, product.getName()));
                }

                // Subtrack to keep order
                productRepository.subtractStock(product.getId(), item.getQuantity());

                // Save detail order
                orderItemRepository.save(OrderItem
                        .builder()
                        .orderId(saveOrder.getId())
                        .productId(product.getId())
                        .quantity(item.getQuantity())
                        .unitPrice(product.getPriceExport())
                        .build());

                if (product.getHasImei()) {
                    List<String> imeis = item.getSelectImeis();
                    if (imeis == null || imeis.isEmpty()) {
                        List<ProductItem> picked = itemRepository
                                .findByProductIdAndStatus(product.getId(), ItemStatus.AVAILABLE.name())
                                .stream()
                                .limit(item.getQuantity())
                                .toList();
                        if (picked.size() < item.getQuantity()) {
                            throw new RuntimeException(MessageFormat.format(Message.Exception.INSUFFICIENT_STOCK, product.getName()));
                        }
                        imeis = picked.stream().map(ProductItem::getImei).toList();
                    } else if (imeis.size() != item.getQuantity()) {
                        throw new RuntimeException(MessageFormat.format(Message.Exception.IMEI_COUNT_MISMATCH, product.getName()));
                    }
                    for (String imei : imeis) {
                        stockService.exportByImei(saveOrder.getId(), imei);
                    }
                } else {
                    stockService.saveMovement(
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
            // Update total and check order complete
            saveOrder.setTotalAmount(total);

            // Check if order was exported (Especially item has IMEI)
            // If order include IMEI -> Status change to COMPLETED
            stockService.checkAndCompleteOrder(saveOrder);
            saveOrder.setCustomer(customer);
            auditLogService.saveLog(
                    LogConstant.Action.CREATE_ORDER,
                    LogConstant.Entity.ORDER,
                    saveOrder.getId().toString(),
                    LogConstant.Status.SUCCESS,
                    "Sale created order");
            return OrderMappingHelper.map(orderRepository.save(saveOrder));
        });
    }


    public OrderResponse cancelOrder(Long orderId) {
        return manager.execute(() -> {
            Order order = orderRepository
                    .findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND));

            if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.COMPLETED) {
                throw new RuntimeException(Message.Exception.CANCEL_ORDER_STATUS_INVALID);
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
            Customer customer = customerRepository
                    .findById(order.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.CUSTOMER_NOT_FOUND));
            order.setStatus(OrderStatus.CANCELED);
            auditLogService.saveLog(
                    LogConstant.Action.CANCEL_ORDER,
                    LogConstant.Entity.ORDER,
                    order.getId().toString(),
                    LogConstant.Status.SUCCESS,
                    "User cancel order");
            Order savedOrder = orderRepository.save(order);
            savedOrder.setCustomer(customer);
            return OrderMappingHelper.map(savedOrder);
        });
    }


    public void returnOrder(Long orderId, RefundRequest req) {
        manager.execute(() -> {
            if (req.getImeis() == null || req.getImeis().isEmpty()) {
                throw new RuntimeException(Message.Exception.RETURN_IMEI_LIST_EMPTY);
            }

            for (String imei : req.getImeis()) {
                ProductItem item = itemRepository
                        .findByImei(imei)
                        .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));
                log.info("Order id: {}", item.getOrderId());
                if (item.getOrderId() == null || !item.getOrderId().equals(orderId)) {
                    throw new RuntimeException(MessageFormat.format(Message.Exception.IMEI_NOT_BELONG_TO_ORDER, imei, orderId));
                }
                stockService.returnProduct(imei, req.getReason());
            }

            auditLogService.saveLog(
                    LogConstant.Action.RETURN_ORDER,
                    LogConstant.Entity.ORDER,
                    orderId.toString(),
                    LogConstant.Status.SUCCESS,
                    "User return order with IMEI: " + String.join(", ", req.getImeis()) + " . Reason: " + req.getReason());
            return null;
        });
    }
}
