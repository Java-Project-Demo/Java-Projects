package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = "locations")
@ToString(callSuper = true, exclude = "locations")
public class Warehouse extends AbstractMappedEntity {
    private Long id;

    private String name;

    private String address;

    @Builder.Default
    private List<WarehouseLocation> locations = new ArrayList<>();
}
