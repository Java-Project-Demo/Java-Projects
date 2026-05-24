package org.dawn.backend.entity;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.warranty.WarrantyStatus;

import java.time.Instant;

@Entity
@Table(name = "warranty_claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Hidden
@EqualsAndHashCode(exclude = {"staff", "customer", "productItem"})
@ToString(exclude = {"staff", "customer", "productItem"})
public class Warranty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "product_item_id")
    private Long productItemId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "issue_description", columnDefinition = "TEXT")
    private String issueDescription;

    @Column(name = "status", length = 50)
    @Enumerated(EnumType.STRING)
    private WarrantyStatus status;

    @Column(name = "received_date")
    private Instant receivedDate;

    @Column(name = "return_date")
    private Instant returnDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private User staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_item_id", insertable = false, updatable = false)
    private ProductItem productItem;
}
