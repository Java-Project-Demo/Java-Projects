package org.dawn.backend.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.ProductStatus;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class Product extends AbstractMappedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sku;

    private String name;

    @Column(name = "price_import")
    private BigDecimal priceImport;

    @Column(name = "price_export")
    private BigDecimal priceExport;

    @Builder.Default
    @Column(name = "current_stock")
    private Integer currentStock = 0;

    @Builder.Default
    @Column(name = "min_threshold")
    private Integer minThreshold = 5;

    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.ACTIVE;
}
