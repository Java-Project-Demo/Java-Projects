package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.OrderStatus;
import org.dawn.backend.constant.PaymentMethod;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class Order extends AbstractMappedEntity {
    private Long id;

    private Long saleId;

    private Long customerId;

    private BigDecimal totalAmount;

    private PaymentMethod paymentMethod;

    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    private Customer customer;
}
