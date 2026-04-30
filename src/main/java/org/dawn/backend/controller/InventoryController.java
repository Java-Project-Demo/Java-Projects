package org.dawn.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.annotation.Post;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.service.InventoryService;

@RequiredArgsConstructor
public class InventoryController extends AbstractController {
    private final InventoryService inventoryService;

    @Post("/start")
    public ResponseObject<Long> startSession(HttpServletRequest req) {
        return ResponseObject.success(inventoryService.startSession());
    }

    @Post("/scan")
    public ResponseObject<String> recordScan(HttpServletRequest req) {
        Long sessionId = Long.valueOf(req.getParameter("sessionId"));
        String imei = req.getParameter("imei");
        Long actualLocId = Long.valueOf(req.getParameter("actualLocId"));

        inventoryService.recordScan(sessionId, imei, actualLocId);
        return ResponseObject.success("Scan recorded");
    }

    @Post("/complete")
    public ResponseObject<String> completeSession(HttpServletRequest req) {
        Long sessionId = Long.valueOf(req.getParameter("sessionId"));
        inventoryService.completeSession(sessionId);
        return ResponseObject.success("Inventory session completed and reconciled");
    }
}
