package org.dawn.backend.controller.catalog;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.dto.catalog.CategoryRequest;
import org.dawn.backend.dto.catalog.CategoryResponse;
import org.dawn.backend.service.catalog.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("")
    public ResponseObject<List<CategoryResponse>> getCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseObject.success(categoryService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseObject<CategoryResponse> getCategory(@PathVariable Long id) {
        return ResponseObject.success(categoryService.getOne(id));
    }

    @PostMapping("")
    public ResponseObject<CategoryResponse> addCategory(@RequestBody CategoryRequest dto) {
        return ResponseObject.success(categoryService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseObject<CategoryResponse> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest dto) {
        return ResponseObject.success(categoryService.updateCategory(id, dto));
    }

    @PutMapping("/{id}/status")
    public ResponseObject<CategoryResponse> updateStatus(@PathVariable Long id, @RequestBody Boolean isDeleted) {
        return ResponseObject.success(categoryService.updateStatus(id, isDeleted));
    }

}
