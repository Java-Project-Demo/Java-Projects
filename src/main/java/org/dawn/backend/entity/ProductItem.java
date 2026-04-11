package org.dawn.backend.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.ItemStatus;

import java.time.Instant;

@Entity
@Table(name = "product_items")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class ProductItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "imei")
    private String imei;

    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.AVAILABLE;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "import_date")
    @Builder.Default
    private Instant importDate = Instant.now();

    @Column(name = "sold_date")
    private Instant soldDate;
}
