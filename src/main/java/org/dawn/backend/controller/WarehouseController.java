package org.dawn.backend.controller;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.dto.request.ImportImeiRequest;
import org.dawn.backend.dto.request.ProductRequest;
import org.dawn.backend.entity.Product;
import org.dawn.backend.service.WarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/warehouse")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addProduct(@RequestBody ProductRequest p) {
        return ResponseEntity.ok(warehouseService.create(p));
    }


    @PostMapping("/stock/import")
    @PreAuthorize("hasRole('STOCK') or hasRole('ADMIN')")
    public ResponseEntity<?> importImeis(@RequestBody ImportImeiRequest req) {
        return ResponseEntity.ok(warehouseService.importImeis(req.getProductId(), req.getImeis()));
    }


    @PostMapping("/stock/export")
    @PreAuthorize("hasRole('STOCK') or hasRole('ADMIN')")
    public ResponseEntity<?> exportImei(@RequestParam Long orderId, @RequestParam String imei) {
        return ResponseEntity.ok(warehouseService.exportByImei(orderId, imei));
    }
}
