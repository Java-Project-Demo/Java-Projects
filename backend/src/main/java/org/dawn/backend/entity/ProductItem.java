package org.dawn.backend.entity;


import io.swagger.v3.oas.annotations.Hidden;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.catalog.ItemStatus;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "product_items")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Hidden
@EqualsAndHashCode(exclude = {"supplier", "product", "location"})
@ToString(exclude = {"supplier", "product", "location"})
public class ProductItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "imei", nullable = false, unique = true, length = 50)
    private String imei;

    @Column(name = "cost_price", precision = 19, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "condition", length = 50)
    private String condition;

    @Column(name = "status", length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ItemStatus status = ItemStatus.AVAILABLE;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "warranty_expiry_date")
    private Instant warrantyExpiryDate;

    @Column(name = "import_date")
    @Builder.Default
    private Instant importDate = Instant.now();

    @Column(name = "sold_date")
    private Instant soldDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", insertable = false, updatable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", insertable = false, updatable = false)
    private WarehouseLocation location;
}
