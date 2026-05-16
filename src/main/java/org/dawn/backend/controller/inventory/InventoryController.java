package org.dawn.backend.controller.inventory;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.annotation.Get;
import org.dawn.backend.config.web.annotation.Post;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.controller.base.AbstractController;
import org.dawn.backend.dto.inventory.InventorySessionResponse;
import org.dawn.backend.dto.inventory.ScanResultResponse;
import org.dawn.backend.dto.inventory.SessionSummaryResponse;
import org.dawn.backend.dto.inventory.StartSessionRequest;
import org.dawn.backend.service.inventory.InventoryService;

@RequiredArgsConstructor
public class InventoryController extends AbstractController {
    private final InventoryService inventoryService;

    @Post("/start")
    public ResponseObject<InventorySessionResponse> startSession(HttpServletRequest req, HttpServletResponse res) {
        StartSessionRequest dto = body(req, StartSessionRequest.class);
        Long warehouseId = dto != null ? dto.getWarehouseId() : null;
        return ResponseObject.success(inventoryService.startSession(warehouseId));
    }

    @Post("/scan")
    public ResponseObject<ScanResultResponse> recordScan(HttpServletRequest req, HttpServletResponse res) {
        Long sessionId = Long.valueOf(req.getParameter("sessionId"));
        String imei = req.getParameter("imei");
        Long actualLocId = Long.valueOf(req.getParameter("actualLocId"));
        return ResponseObject.success(inventoryService.recordScan(sessionId, imei, actualLocId));
    }

    @Post("/complete")
    public ResponseObject<SessionSummaryResponse> completeSession(HttpServletRequest req, HttpServletResponse res) {
        Long sessionId = Long.valueOf(req.getParameter("sessionId"));
        return ResponseObject.success(inventoryService.completeSession(sessionId));
    }

    @Get("/{id}/summary")
    public ResponseObject<SessionSummaryResponse> getSummary(HttpServletRequest req, HttpServletResponse res) {
        Long sessionId = getPathId(req);
        return ResponseObject.success(inventoryService.getSummary(sessionId));
    }
}
