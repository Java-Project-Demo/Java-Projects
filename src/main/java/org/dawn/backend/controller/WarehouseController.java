package org.dawn.backend.controller;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.annotation.Get;
import org.dawn.backend.config.annotation.Post;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.entity.Warehouse;
import org.dawn.backend.entity.WarehouseLocation;
import org.dawn.backend.service.WarehouseService;

import java.util.List;

@RequiredArgsConstructor
public class WarehouseController extends AbstractController {
    private final WarehouseService warehouseService;

    @Post("/create")
    public ResponseObject<Warehouse> create(HttpServletRequest req) {
        Warehouse dto = body(req, Warehouse.class);
        return ResponseObject.success(warehouseService.createWarehouse(dto));
    }

    @Post("/setup-layout")
    public ResponseObject<String> setupLayout(HttpServletRequest req) {
        Long warehouseId = Long.valueOf(req.getParameter("warehouseId"));
        String zone = req.getParameter("zone");
        String row = req.getParameter("row");
        int shelfCount = Integer.parseInt(req.getParameter("shelfCount"));
        int binCount = Integer.parseInt(req.getParameter("binCount"));

        warehouseService.setupLocLayout(warehouseId, zone, row, shelfCount, binCount);
        return ResponseObject.success("Initialize layout success");
    }

    @Post("/move-item")
    public ResponseObject<String> moveItem(HttpServletRequest req) {
        String imei = req.getParameter("imei");
        Long targetLocId = Long.valueOf(req.getParameter("targetLocId"));

        warehouseService.moveItem(imei, targetLocId);
        return ResponseObject.success("Move item successfully");
    }

    @Get("/map")
    public ResponseObject<List<Warehouse>> getMap(HttpServletRequest req) {
        return ResponseObject.success(warehouseService.getPhysicalMap());
    }

    @Get("/available-bins")
    public ResponseObject<List<WarehouseLocation>> getAvailableBins(HttpServletRequest req) {
        Long warehouseId = Long.valueOf(req.getParameter("warehouseId"));
        return ResponseObject.success(warehouseService.getAvailableBins(warehouseId));
    }
}
