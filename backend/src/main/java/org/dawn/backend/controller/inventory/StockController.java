package org.dawn.backend.controller.inventory;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.dto.catalog.ProductItemResponse;
import org.dawn.backend.dto.catalog.ProductMappingHelper;
import org.dawn.backend.dto.catalog.ProductResponse;
import org.dawn.backend.dto.inventory.ImportImeiRequest;
import org.dawn.backend.dto.inventory.MarkDamagedRequest;
import org.dawn.backend.service.inventory.StockService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @PostMapping("/import")
    public ResponseObject<ProductResponse> importImei(@RequestBody ImportImeiRequest dto) {
        return ResponseObject.success(stockService.importImei(dto));
    }

    @PostMapping("/export")
    public ResponseObject<ProductItemResponse> exportImei(@RequestParam Long orderId, @RequestParam String imei) {
        return ResponseObject.success(stockService.exportByImei(orderId, imei));
    }

    @PostMapping("/mark-damaged")
    public ResponseObject<ProductItemResponse> markDamaged(@RequestBody MarkDamagedRequest dto) {
        return ResponseObject.success(ProductMappingHelper.mapItem(stockService.markAsDamaged(dto.getImei(), dto.getReason())));
    }

    @PostMapping("/return-product")
    public ResponseObject<ProductItemResponse> returnProduct(@RequestParam String imei, @RequestParam String reason) {
        return ResponseObject.success(ProductMappingHelper.mapItem(stockService.returnProduct(imei, reason)));
    }
}
