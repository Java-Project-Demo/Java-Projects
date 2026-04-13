package org.dawn.backend.controller;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.config.response.ResponsePage;
import org.dawn.backend.dto.request.ImportImeiRequest;
import org.dawn.backend.dto.request.ProductRequest;
import org.dawn.backend.dto.response.ProductResponse;
import org.dawn.backend.service.WarehouseService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/warehouse")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping("/products")
    public ResponseObject<ResponsePage<ProductResponse>> getProducts(Pageable pageable) {
        return ResponseObject.success(warehouseService.getAll(pageable));
    }

    @GetMapping("/products/{id}")
    public ResponseObject<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseObject.success(warehouseService.getOne(id));
    }

    @PostMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseObject<ProductResponse> addProduct(@RequestBody ProductRequest p) {
        return ResponseObject.success(warehouseService.create(p));
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseObject<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody ProductRequest p) {
        return ResponseObject.success(warehouseService.updateProduct(id, p));
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
