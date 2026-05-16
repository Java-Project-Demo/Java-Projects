package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.inventory.SessionStatus;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false, exclude = "staff")
@ToString(exclude = "staff")
public class InventorySession {
    private Long id;

    private Long warehouseId;

    private Long createdBy;

    private SessionStatus status;

    private Instant startDate;

    private Instant endDate;

    private User staff;

    private Warehouse warehouse;
}
