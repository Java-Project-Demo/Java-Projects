package org.dawn.backend.dto.inventory;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ScanResultResponse {
    private Long detailId;
    private String imei;
    private String status;
    private String productName;
    private String productSku;
    private Long expectedLocId;
    private String expectedLocLabel;
    private Long actualLocId;
    private String actualLocLabel;
    private String note;
}
