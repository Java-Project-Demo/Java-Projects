package org.dawn.backend.controller.inventory;


import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.dto.inventory.WarehouseLocationResponse;
import org.dawn.backend.dto.inventory.WarehouseRequest;
import org.dawn.backend.dto.inventory.WarehouseResponse;
import org.dawn.backend.dto.inventory.WarehouseSetupRequest;
import org.dawn.backend.service.inventory.WarehouseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/warehouse")
@RequiredArgsConstructor
public class WarehouseController {
    private final WarehouseService warehouseService;

    @PostMapping("/create")
    public ResponseObject<WarehouseResponse> create(@RequestBody WarehouseRequest dto) {
        return ResponseObject.success(warehouseService.createWarehouse(dto));
    }

    @PostMapping("/setup-layout")
    public ResponseObject<String> setupLayout(@ModelAttribute WarehouseSetupRequest req) {
        warehouseService.setupLocLayout(
                req.getWarehouseId(),
                req.getZone(),
                req.getRow(),
                req.getShelfCount(),
                req.getBinCount());
        return ResponseObject.success("Initialize layout success");
    }

    @PostMapping("/move-item")
    public ResponseObject<String> moveItem(
            @RequestParam String imei,
            @RequestParam Long targetLocId) {
        warehouseService.moveItem(imei, targetLocId);
        return ResponseObject.success("Move item successfully");
    }

    @GetMapping("/map")
    public ResponseObject<List<WarehouseResponse>> getMap() {
        return ResponseObject.success(warehouseService.getPhysicalMap());
    }

    @GetMapping("/available-bins")
    public ResponseObject<List<WarehouseLocationResponse>> getAvailableBins(
            @RequestParam Long warehouseId,
            @RequestParam Long productId) {
        return ResponseObject.success(warehouseService.getAvailableBins(warehouseId, productId));
    }
}
