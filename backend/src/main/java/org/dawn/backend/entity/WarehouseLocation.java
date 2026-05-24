package org.dawn.backend.entity;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "warehouse_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Hidden
@EqualsAndHashCode(exclude = {"warehouse", "items"})
@ToString(exclude = {"warehouse", "items"})
public class WarehouseLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "zone_name", length = 50)
    private String zoneName;

    @Column(name = "row_num", length = 20)
    private String rowNum;

    @Column(name = "shelf_num", length = 20)
    private String shelfNum;

    @Column(name = "bin_num", length = 20)
    private String binNum;

    @Column(name = "capacity", nullable = false)
    private Long capacity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", insertable = false, updatable = false)
    private Warehouse warehouse;

    @OneToMany(mappedBy = "location", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductItem> items = new ArrayList<>();
}
