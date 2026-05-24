package org.dawn.backend.dto.inventory;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class WarehouseLocationResponse {
    private Long id;

    private Long warehouseId;

    private String zoneName;

    private String rowNum;

    private String shelfNum;

    private String binNum;

    private Long capacity;

    @Builder.Default
    @JsonIgnoreProperties(ignoreUnknown = true)
    private List<LocationItemMini> items = new ArrayList<>();
}
