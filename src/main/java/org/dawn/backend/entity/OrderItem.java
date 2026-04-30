package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false, exclude = "product")
@ToString(exclude = "product")
public class OrderItem {

    private Long id;

    private Long orderId;

    private Long productId;

    private Integer quantity;

    private BigDecimal unitPrice;

    private Product product;
}
