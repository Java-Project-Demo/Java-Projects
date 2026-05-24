package org.dawn.backend.entity;


import io.swagger.v3.oas.annotations.Hidden;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.system.ActiveStatus;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Hidden
@EqualsAndHashCode(callSuper = true, exclude = {"items", "category"})
@ToString(exclude = {"items", "category"})
public class Product extends AbstractMappedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "sku", nullable = false, unique = true, length = 50)
    private String sku;

    @Column(name = "name")
    private String name;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "specifications", columnDefinition = "TEXT")
    private String specifications;

    @Column(name = "warranty_period")
    private Long warrantyPeriod;

    @Column(name = "has_imei")
    @Builder.Default
    private Boolean hasImei = true;

    @Column(name = "price_import_std", precision = 19, scale = 2)
    private BigDecimal priceImport;

    @Column(name = "price_export_std", precision = 19, scale = 2)
    private BigDecimal priceExport;

    @Column(name = "current_stock", nullable = false)
    @Builder.Default
    private Integer currentStock = 0;

    @Column(name = "min_threshold")
    @Builder.Default
    private Integer minThreshold = 5;

    @Column(name = "status", length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ActiveStatus status = ActiveStatus.INACTIVE;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductItem> items = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;
}
