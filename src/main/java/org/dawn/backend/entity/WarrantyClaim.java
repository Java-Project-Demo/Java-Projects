package org.dawn.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class WarrantyClaim {
    private Long id;

    private Long productItemId;

    private Long customerId;

    private Long createdBy;

    private String issueDescription;

    private String status;

    private Instant receivedDate;

    private Instant returnDate;
}
