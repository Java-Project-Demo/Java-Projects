package org.dawn.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.MovementType;


@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class StockMovement extends AbstractMappedEntity {
    private Long id;

    private Long productId;

    private MovementType type;

    private String actionType;

    private Integer quantity;


    private Long referenceId;

    private Long createdBy;

    private String note;


}
