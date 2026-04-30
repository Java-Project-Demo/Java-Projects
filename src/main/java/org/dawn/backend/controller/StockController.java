package org.dawn.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.annotation.Post;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.dto.request.ImportImeiRequest;
import org.dawn.backend.dto.response.ProductItemResponse;
import org.dawn.backend.dto.response.ProductResponse;
import org.dawn.backend.helper.ProductMappingHelper;
import org.dawn.backend.service.StockService;

@RequiredArgsConstructor
public class StockController extends AbstractController {

    private final StockService stockService;

    @Post("/import")
    public ResponseObject<ProductResponse> importImei(HttpServletRequest req) {
        ImportImeiRequest dto = body(req, ImportImeiRequest.class);
        return ResponseObject.success(stockService.importImei(dto));
    }

    @Post("/export")
    public ResponseObject<ProductItemResponse> exportImei(HttpServletRequest req) {
        Long orderId = Long.valueOf(req.getParameter("orderId"));
        String imei = req.getParameter("imei");
        return ResponseObject.success(stockService.exportByImei(orderId, imei));
    }

    @Post("/mark-damaged")
    public ResponseObject<ProductItemResponse> markDamaged(HttpServletRequest req) {
        String imei = req.getParameter("imei");
        String reason = req.getParameter("reason");
        return ResponseObject.success(ProductMappingHelper.mapItem(stockService.markAsDamaged(imei, reason)));
    }

    @Post("/return-product")
    public ResponseObject<ProductItemResponse> returnProduct(HttpServletRequest req) {
        String imei = req.getParameter("imei");
        String reason = req.getParameter("reason");
        return ResponseObject.success(ProductMappingHelper.mapItem(stockService.returnProduct(imei, reason)));
    }
}
