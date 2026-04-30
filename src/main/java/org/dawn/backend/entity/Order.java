package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.sales.OrderStatus;
import org.dawn.backend.constant.sales.PaymentMethod;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = {"seller", "customer", "items"})
@ToString(exclude = {"seller", "customer", "items"})
public class Order extends AbstractMappedEntity {
    private Long id;

    private Long saleId;

    private Long customerId;

    private BigDecimal totalAmount;

    private PaymentMethod paymentMethod;

    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    private User seller;

    private Customer customer;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}
