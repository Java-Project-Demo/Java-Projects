package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.inventory.MovementType;


@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = {"supplier", "product", "staff"})
@ToString(exclude = {"supplier", "product", "staff"})
public class StockMovement extends AbstractMappedEntity {
    private Long id;

    private Long productId;

    private MovementType type;

    private String actionType;

    private Integer quantity;

    private Long referenceId;

    private Long supplierId;

    private Long createdBy;

    private String note;

    private Product product;

    private Supplier supplier;

    private User staff;
}
