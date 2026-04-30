package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.warranty.WarrantyStatus;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(exclude = {"staff", "customer", "productItem"})
@ToString(exclude = {"staff", "customer", "productItem"})
public class Warranty {
    private Long id;

    private Long productItemId;

    private Long customerId;

    private Long createdBy;

    private String issueDescription;

    private WarrantyStatus status;

    private Instant receivedDate;

    private Instant returnDate;

    private User staff;

    private Customer customer;

    private ProductItem productItem;
}
