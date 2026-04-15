package org.dawn.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.Loggable;
import org.dawn.backend.constant.OrderStatus;
import org.dawn.backend.dto.request.CartItemRequest;
import org.dawn.backend.dto.request.OrderRequest;
import org.dawn.backend.entity.Order;
import org.dawn.backend.entity.OrderItem;
import org.dawn.backend.entity.Product;
import org.dawn.backend.helper.UserHelper;
import org.dawn.backend.repository.OrderItemRepository;
import org.dawn.backend.repository.OrderRepository;
import org.dawn.backend.repository.ProductRepository;

import java.math.BigDecimal;


@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;

    private final OrderItemRepository orderItemRepository;

    private final ProductRepository productRepository;

    private final UserHelper userHelper;


    @Loggable(action = "CREATE_ORDER", entity = "ORDER")
    public Order create(OrderRequest req) {
        Long saleId = userHelper.getCurrentUserId();


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


    @Loggable(action = "CANCEL_ORDER", entity = "ORDER")
    public Order cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException();
        }

        order.setStatus(OrderStatus.CANCELED);
        return orderRepository.save(order);
    }
}
