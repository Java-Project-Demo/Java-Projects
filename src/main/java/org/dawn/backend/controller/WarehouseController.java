package org.dawn.backend.controller;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.annotation.Post;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.dto.request.ImportImeiRequest;
import org.dawn.backend.dto.response.ProductItemResponse;
import org.dawn.backend.dto.response.ProductResponse;
import org.dawn.backend.service.WarehouseService;

@RequiredArgsConstructor
public class WarehouseController extends AbstractController {

    private final WarehouseService warehouseService;

    @Post("/import")
    public ResponseObject<ProductResponse> importImei(HttpServletRequest req) {
        ImportImeiRequest dto = body(req, ImportImeiRequest.class);
        return ResponseObject.success(warehouseService.importImei(dto));
    }

    @Post("/export")
    public ResponseObject<ProductItemResponse> exportImei(HttpServletRequest req) {
        Long orderId = Long.valueOf(req.getParameter("orderId"));
        String imei = req.getParameter("imei");
        return ResponseObject.success(warehouseService.exportByImei(orderId, imei));
    }
}
