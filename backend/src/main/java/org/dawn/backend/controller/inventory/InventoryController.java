package org.dawn.backend.controller.inventory;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.dto.inventory.InventorySessionResponse;
import org.dawn.backend.dto.inventory.ScanResultResponse;
import org.dawn.backend.dto.inventory.SessionSummaryResponse;
import org.dawn.backend.dto.inventory.StartSessionRequest;
import org.dawn.backend.service.inventory.InventoryService;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/inventory")
public class InventoryController {
    private final InventoryService inventoryService;

    @PostMapping("/start")
    public ResponseObject<InventorySessionResponse> startSession(@RequestBody StartSessionRequest dto) {
        Long warehouseId = dto != null ? dto.getWarehouseId() : null;
        return ResponseObject.success(inventoryService.startSession(warehouseId));
    }

    @PostMapping("/scan")
    public ResponseObject<ScanResultResponse> recordScan(
            @RequestParam(required = false) Long sessionId,
            @RequestParam(required = false) String imei,
            @RequestParam(required = false) Long actualLocId) {
        return ResponseObject.success(inventoryService.recordScan(sessionId, imei, actualLocId));
    }

    @PostMapping("/complete")
    public ResponseObject<SessionSummaryResponse> completeSession(@RequestParam Long sessionId) {
        return ResponseObject.success(inventoryService.completeSession(sessionId));
    }

    @GetMapping("/{id}/summary")
    public ResponseObject<SessionSummaryResponse> getSummary(@PathVariable Long id) {
        return ResponseObject.success(inventoryService.getSummary(id));
    }
}
