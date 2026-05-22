package org.dawn.backend.controller.inventory;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.annotation.Get;
import org.dawn.backend.config.web.annotation.Post;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.controller.base.AbstractController;
import org.dawn.backend.dto.inventory.WarehouseLocationResponse;
import org.dawn.backend.dto.inventory.WarehouseRequest;
import org.dawn.backend.dto.inventory.WarehouseResponse;
import org.dawn.backend.service.inventory.WarehouseService;

import java.util.List;

@RequiredArgsConstructor
public class WarehouseController extends AbstractController {
    private final WarehouseService warehouseService;

    @Post("/create")
    public ResponseObject<WarehouseResponse> create(HttpServletRequest req, HttpServletResponse res) {
        WarehouseRequest dto = body(req, WarehouseRequest.class);
        return ResponseObject.success(warehouseService.createWarehouse(dto));
    }

    @Post("/setup-layout")
    public ResponseObject<String> setupLayout(HttpServletRequest req, HttpServletResponse res) {
        Long warehouseId = Long.valueOf(req.getParameter("warehouseId"));
        String zone = req.getParameter("zone");
        String row = req.getParameter("row");
        int shelfCount = Integer.parseInt(req.getParameter("shelfCount"));
        int binCount = Integer.parseInt(req.getParameter("binCount"));

        warehouseService.setupLocLayout(warehouseId, zone, row, shelfCount, binCount);
        return ResponseObject.success("Initialize layout success");
    }

    @Post("/move-item")
    public ResponseObject<String> moveItem(HttpServletRequest req, HttpServletResponse res) {
        String imei = req.getParameter("imei");
        Long targetLocId = Long.valueOf(req.getParameter("targetLocId"));

        warehouseService.moveItem(imei, targetLocId);
        return ResponseObject.success("Move item successfully");
    }

    @Get("/map")
    public ResponseObject<List<WarehouseResponse>> getMap(HttpServletRequest req, HttpServletResponse res) {
        return ResponseObject.success(warehouseService.getPhysicalMap());
    }

    @Get("/available-bins")
    public ResponseObject<List<WarehouseLocationResponse>> getAvailableBins(HttpServletRequest req, HttpServletResponse res) {
        Long warehouseId = Long.valueOf(req.getParameter("warehouseId"));
        Long productId = Long.valueOf(req.getParameter("productId"));
        return ResponseObject.success(warehouseService.getAvailableBins(warehouseId, productId));
    }
}
