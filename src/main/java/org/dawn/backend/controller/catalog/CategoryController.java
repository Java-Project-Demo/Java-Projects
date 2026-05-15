package org.dawn.backend.controller.catalog;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.annotation.Get;
import org.dawn.backend.config.web.annotation.Post;
import org.dawn.backend.config.web.annotation.Put;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.constant.auth.URole;
import org.dawn.backend.controller.base.AbstractController;
import org.dawn.backend.dto.catalog.CategoryRequest;
import org.dawn.backend.dto.catalog.CategoryResponse;
import org.dawn.backend.service.catalog.CategoryService;

import java.util.List;

@RequiredArgsConstructor
public class CategoryController extends AbstractController {

    private final CategoryService categoryService;

    @Get("/")
    public ResponseObject<List<CategoryResponse>> getCategories(HttpServletRequest req, HttpServletResponse res) {
        int page = Integer.parseInt(req.getParameter("page") != null ? req.getParameter("page") : "0");
        int size = Integer.parseInt(req.getParameter("size") != null ? req.getParameter("size") : "10");
        return ResponseObject.success(categoryService.getAll());
    }

    @Get("/{id}")
    public ResponseObject<CategoryResponse> getCategory(HttpServletRequest req, HttpServletResponse res) {

        return ResponseObject.success(categoryService.getOne(getPathId(req)));
    }

    @Post("/")
    public ResponseObject<CategoryResponse> addCategory(HttpServletRequest req, HttpServletResponse res) {
        checkRole(URole.ADMIN.name());
        CategoryRequest dto = body(req, CategoryRequest.class);
        return ResponseObject.success(categoryService.create(dto));
    }

    @Put("/{id}")
    public ResponseObject<CategoryResponse> updateCategory(HttpServletRequest req, HttpServletResponse res) {
        checkRole(URole.ADMIN.name());
        CategoryRequest dto = body(req, CategoryRequest.class);
        return ResponseObject.success(categoryService.updateCategory(getPathId(req), dto));
    }

    @Put("/{id}/status")
    public ResponseObject<CategoryResponse> updateStatus(HttpServletRequest req, HttpServletResponse res) {
        checkRole(URole.ADMIN.name());
        Boolean isDeleted = body(req, Boolean.class);
        return ResponseObject.success(categoryService.updateStatus(getPathId(req), isDeleted));
    }

}
