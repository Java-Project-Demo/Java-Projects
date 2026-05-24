package org.dawn.backend.entity;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.inventory.MovementType;


@Entity
@Table(name = "stock_movements")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Hidden
@EqualsAndHashCode(callSuper = true, exclude = {"supplier", "product", "staff"})
@ToString(exclude = {"supplier", "product", "staff"})
public class StockMovement extends AbstractMappedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private MovementType type;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "note", length = 500)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", insertable = false, updatable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private User staff;
}
