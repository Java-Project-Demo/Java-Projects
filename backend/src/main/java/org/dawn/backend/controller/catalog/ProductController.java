package org.dawn.backend.controller.catalog;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.dto.catalog.ProductRequest;
import org.dawn.backend.dto.catalog.ProductResponse;
import org.dawn.backend.dto.catalog.ProductUpdateRequest;
import org.dawn.backend.service.catalog.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping("")
    public ResponseObject<List<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseObject.success(productService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseObject<ProductResponse> getProduct(@PathVariable Long id, HttpServletResponse res) {
        return ResponseObject.success(productService.getOne(id));
    }

    @PostMapping("")
    public ResponseObject<ProductResponse> addProduct(@RequestBody ProductRequest dto) {
        return ResponseObject.success(productService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseObject<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody ProductUpdateRequest dto) {
        return ResponseObject.success(productService.updateProduct(id, dto));
    }
}
