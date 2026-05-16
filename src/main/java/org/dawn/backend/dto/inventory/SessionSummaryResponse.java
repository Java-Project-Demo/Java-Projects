package org.dawn.backend.dto.inventory;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SessionSummaryResponse {
    private InventorySessionResponse session;
    private int matchCount;
    private int mismatchCount;
    private int missingCount;
    private int extraCount;
    private List<ScanResultResponse> details;
}
