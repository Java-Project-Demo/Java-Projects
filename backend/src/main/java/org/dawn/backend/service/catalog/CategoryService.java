package org.dawn.backend.service.catalog;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.catalog.CategoryMappingHelper;
import org.dawn.backend.dto.catalog.CategoryRequest;
import org.dawn.backend.dto.catalog.CategoryResponse;
import org.dawn.backend.entity.Category;
import org.dawn.backend.exception.wrapper.ResourceAlreadyExistedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.catalog.CategoryRepository;
import org.dawn.backend.service.system.AuditLogService;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public List<CategoryResponse> getAll(int page, int size) {
        return categoryRepository
                .findAll()
                .stream()
                .map(CategoryMappingHelper::map)
                .toList();
    }

    public List<CategoryResponse> getAll() {
        return categoryRepository
                .findAll()
                .stream()
                .map(CategoryMappingHelper::map)
                .toList();
    }

    public CategoryResponse getOne(Long id) {
        return categoryRepository
                .findById(id)
                .map(CategoryMappingHelper::map)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.CATEGORY_NOT_FOUND));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        categoryRepository.findByName(req.getName()).ifPresent(p -> {
            throw new ResourceAlreadyExistedException(Message.Exception.CATEGORY_EXISTED);
        });
        Category category = categoryRepository.save(CategoryMappingHelper.map(req));
        auditLogService.saveLog(
                LogConstant.Action.CREATE_CATEGORY,
                LogConstant.Entity.CATEGORY,
                category.getId().toString(),
                LogConstant.Status.SUCCESS,
                "Admin create category");
        return CategoryMappingHelper.map(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest req) {
        Category existing = categoryRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.CATEGORY_NOT_FOUND));
        existing.setName(req.getName());
        existing.setDescription(req.getDescription());
        auditLogService.saveLog(
                LogConstant.Action.UPDATE_CATEGORY,
                LogConstant.Entity.CATEGORY,
                existing.getId().toString(),
                LogConstant.Status.SUCCESS,
                "Admin update category");
        categoryRepository.save(existing);
        return CategoryMappingHelper.map(existing);
    }

    @Transactional
    public CategoryResponse updateStatus(Long id, Boolean status) {
        Category category = categoryRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.CATEGORY_NOT_FOUND));
        category.setIsDeleted(status);
        Category savedCategory = categoryRepository.save(category);
        auditLogService.saveLog(
                LogConstant.Action.UPDATE_CATEGORY,
                LogConstant.Entity.CATEGORY,
                savedCategory.getId().toString(),
                LogConstant.Status.SUCCESS,
                "Update category status");
        return CategoryMappingHelper.map(savedCategory);
    }
}
