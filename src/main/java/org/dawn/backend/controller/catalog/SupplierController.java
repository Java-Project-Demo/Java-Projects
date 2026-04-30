package org.dawn.backend.controller.catalog;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.annotation.Get;
import org.dawn.backend.config.web.annotation.Post;
import org.dawn.backend.config.web.annotation.Put;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.controller.base.AbstractController;
import org.dawn.backend.dto.catalog.SupplierRequest;
import org.dawn.backend.dto.catalog.SupplierResponse;
import org.dawn.backend.dto.catalog.SupplierUpdateRequest;
import org.dawn.backend.service.catalog.SupplierService;

import java.util.List;

@RequiredArgsConstructor
public class SupplierController extends AbstractController {
    private final SupplierService supplierService;

    @Get("/")
    public ResponseObject<List<SupplierResponse>> getAll(HttpServletRequest req) {
        return ResponseObject.success(supplierService.getAll());
    }

    @Get("/{id}")
    public ResponseObject<SupplierResponse> getOne(HttpServletRequest req) {
        Long id = getPathId(req);
        return ResponseObject.success(supplierService.getOne(id));
    }

    @Post("/")
    public ResponseObject<SupplierResponse> create(HttpServletRequest req) {
        SupplierRequest dto = body(req, SupplierRequest.class);
        return ResponseObject.created(supplierService.create(dto));
    }

    @Put("/{id}")
    public ResponseObject<SupplierResponse> update(HttpServletRequest req) {
        Long id = getPathId(req);
        SupplierUpdateRequest dto = body(req, SupplierUpdateRequest.class);
        return ResponseObject.created(supplierService.update(id, dto));
    }
}
