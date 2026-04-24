package org.dawn.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.annotation.Get;
import org.dawn.backend.config.annotation.Post;
import org.dawn.backend.config.annotation.Put;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.dto.request.ProductRequest;
import org.dawn.backend.dto.response.ProductResponse;
import org.dawn.backend.service.WarehouseService;

import java.util.List;

@RequiredArgsConstructor
public class ProductController extends AbstractController {
    private final WarehouseService warehouseService;

    @Get("/")
    public ResponseObject<List<ProductResponse>> getProducts(HttpServletRequest req) {
        int page = Integer.parseInt(req.getParameter("page") != null ? req.getParameter("page") : "0");
        int size = Integer.parseInt(req.getParameter("size") != null ? req.getParameter("size") : "10");
        return ResponseObject.success(warehouseService.getAll());
    }

    @Get("/{id}")
    public ResponseObject<ProductResponse> getProduct(HttpServletRequest req) {
        return ResponseObject.success(warehouseService.getOne(getPathId(req)));
    }

    @Post("/")
    public ResponseObject<ProductResponse> addProduct(HttpServletRequest req) {
        ProductRequest dto = body(req, ProductRequest.class);
        return ResponseObject.success(warehouseService.create(dto));
    }

    @Put("/{id}")
    public ResponseObject<ProductResponse> updateProduct(HttpServletRequest req) {
        ProductRequest dto = body(req, ProductRequest.class);
        return ResponseObject.success(warehouseService.updateProduct(getPathId(req), dto));
    }
}
