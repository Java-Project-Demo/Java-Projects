package org.dawn.backend.entity;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "warehouses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Hidden
@EqualsAndHashCode(callSuper = true, exclude = "locations")
@ToString(callSuper = true, exclude = "locations")
public class Warehouse extends AbstractMappedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "address", length = 500)
    private String address;

    @OneToMany(mappedBy = "warehouse", fetch = FetchType.LAZY)
    @Builder.Default
    private List<WarehouseLocation> locations = new ArrayList<>();
}
