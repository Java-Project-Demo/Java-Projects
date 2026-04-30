package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.inventory.DetailStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false, exclude = {"expectedLocation", "actualLocation"})
@ToString(exclude = {"expectedLocation", "actualLocation"})
public class InventoryDetail {
    private Long id;

    private Long sessionId;

    private String imei;

    private Long expectedLoc;

    private Long actualLoc;

    private DetailStatus recordStatus;

    private String note;

    private WarehouseLocation expectedLocation;

    private WarehouseLocation actualLocation;
}
