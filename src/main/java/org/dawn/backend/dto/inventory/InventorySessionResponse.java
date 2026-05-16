package org.dawn.backend.dto.inventory;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InventorySessionResponse {
    private Long id;
    private Long warehouseId;
    private String warehouseName;
    private String warehouseAddress;
    private Long createdBy;
    private String createdByUsername;
    private String status;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant startDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant endDate;
}
