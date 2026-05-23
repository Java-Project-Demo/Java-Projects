package org.dawn.backend.controller.catalog;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.dto.catalog.SupplierRequest;
import org.dawn.backend.dto.catalog.SupplierResponse;
import org.dawn.backend.dto.catalog.SupplierUpdateRequest;
import org.dawn.backend.service.catalog.SupplierService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/supplier")
@RequiredArgsConstructor
public class SupplierController {
    private final SupplierService supplierService;

    @GetMapping("")
    public ResponseObject<List<SupplierResponse>> getAll() {
        return ResponseObject.success(supplierService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseObject<SupplierResponse> getOne(@PathVariable Long id) {
        return ResponseObject.success(supplierService.getOne(id));
    }

    @PostMapping("")
    public ResponseObject<SupplierResponse> create(@RequestBody SupplierRequest dto) {
        return ResponseObject.created(supplierService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseObject<SupplierResponse> update(@PathVariable Long id, @RequestBody SupplierUpdateRequest dto) {
        return ResponseObject.created(supplierService.update(id, dto));
    }
}
