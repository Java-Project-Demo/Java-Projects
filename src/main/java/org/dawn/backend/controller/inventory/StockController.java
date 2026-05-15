package org.dawn.backend.controller.inventory;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.annotation.Post;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.controller.base.AbstractController;
import org.dawn.backend.dto.inventory.ImportImeiRequest;
import org.dawn.backend.dto.catalog.ProductItemResponse;
import org.dawn.backend.dto.catalog.ProductResponse;
import org.dawn.backend.dto.catalog.ProductMappingHelper;
import org.dawn.backend.dto.inventory.MarkDamagedRequest;
import org.dawn.backend.service.inventory.StockService;

@RequiredArgsConstructor
public class StockController extends AbstractController {

    private final StockService stockService;

    @Post("/import")
    public ResponseObject<ProductResponse> importImei(HttpServletRequest req, HttpServletResponse res) {
        ImportImeiRequest dto = body(req, ImportImeiRequest.class);
        return ResponseObject.success(stockService.importImei(dto));
    }

    @Post("/export")
    public ResponseObject<ProductItemResponse> exportImei(HttpServletRequest req, HttpServletResponse res) {
        Long orderId = Long.valueOf(req.getParameter("orderId"));
        String imei = req.getParameter("imei");
        return ResponseObject.success(stockService.exportByImei(orderId, imei));
    }

    @Post("/mark-damaged")
    public ResponseObject<ProductItemResponse> markDamaged(HttpServletRequest req, HttpServletResponse res) {
        MarkDamagedRequest dto = body(req, MarkDamagedRequest.class);
        return ResponseObject.success(ProductMappingHelper.mapItem(stockService.markAsDamaged(dto.getImei(), dto.getReason())));
    }

    @Post("/return-product")
    public ResponseObject<ProductItemResponse> returnProduct(HttpServletRequest req, HttpServletResponse res) {
        String imei = req.getParameter("imei");
        String reason = req.getParameter("reason");
        return ResponseObject.success(ProductMappingHelper.mapItem(stockService.returnProduct(imei, reason)));
    }
}
