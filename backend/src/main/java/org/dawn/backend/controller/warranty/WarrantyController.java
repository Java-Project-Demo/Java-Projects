package org.dawn.backend.controller.warranty;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.dto.warranty.CreateWarrantyRequest;
import org.dawn.backend.dto.warranty.UpdateWarrantyRequest;
import org.dawn.backend.dto.warranty.WarrantyResponse;
import org.dawn.backend.entity.Warranty;
import org.dawn.backend.service.warranty.WarrantyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/warranty")
@RequiredArgsConstructor
public class WarrantyController {
    private final WarrantyService warrantyService;

    @GetMapping("")
    public ResponseObject<List<WarrantyResponse>> getAll() {
        return ResponseObject.success(warrantyService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseObject<WarrantyResponse> getOne(@PathVariable Long id) {
        return ResponseObject.success(warrantyService.getOne(id));
    }

    @PostMapping("/create")
    public ResponseObject<List<Warranty>> create(@RequestBody CreateWarrantyRequest dto) {
        return ResponseObject.created(warrantyService.createClaim(dto));
    }

    @PutMapping("/update")
    public ResponseObject<Warranty> update(@RequestBody UpdateWarrantyRequest dto) {
        return ResponseObject.success(warrantyService.updateStatus(dto));
    }
}
