package org.dawn.backend.service.catalog;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.catalog.ProductRequest;
import org.dawn.backend.dto.catalog.ProductResponse;
import org.dawn.backend.dto.catalog.ProductUpdateRequest;
import org.dawn.backend.entity.Product;
import org.dawn.backend.exception.wrapper.ResourceAlreadyExistedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.dto.catalog.ProductMappingHelper;
import org.dawn.backend.repository.catalog.ProductRepository;
import org.dawn.backend.service.system.AuditLogService;

import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final AuditLogService auditLogService;
    private final ProductRepository productRepository;
    private final TransactionManager manager;

    public List<ProductResponse> getAll(int page, int size) {
        return productRepository
                .findAll()
                .stream()
                .map(ProductMappingHelper::map)
                .toList();
    }

    public List<ProductResponse> getAll() {
        return productRepository
                .findAll()
                .stream()
                .map(ProductMappingHelper::map)
                .toList();
    }

    public ProductResponse getOne(Long id) {
        return productRepository
                .findById(id)
                .map(ProductMappingHelper::map)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));
    }

    public ProductResponse create(ProductRequest req) {
        return manager.execute(() -> {
            productRepository.findBySku(req.getSku()).ifPresent(p -> {
                throw new ResourceAlreadyExistedException(Message.Exception.PRODUCT_EXISTED);
            });
            long period = (req.getWarrantyPeriod() != null && req.getWarrantyPeriod() > 0) ? req.getWarrantyPeriod() : 12L;
            req.setWarrantyPeriod(period);
            Product product = productRepository.save(ProductMappingHelper.map(req));
            auditLogService.saveLog(
                    LogConstant.Action.CREATE_PRODUCT,
                    LogConstant.Entity.PRODUCT,
                    product.getId().toString(),
                    LogConstant.Status.SUCCESS,
                    "Admin create product");
            return ProductMappingHelper.map(product);
        });
    }

    public ProductResponse updateProduct(Long id, ProductUpdateRequest req) {
        return manager.execute(() -> {
            Product existing = productRepository
                    .findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));
            if (req.getName() != null) existing.setName(req.getName());
            if (req.getCategoryId() != null) existing.setCategoryId(req.getCategoryId());
            if (req.getPriceImport() != null) existing.setPriceImport(req.getPriceImport());
            if (req.getPriceExport() != null) existing.setPriceExport(req.getPriceExport());
            if (req.getMinThreshold() != null) existing.setMinThreshold(req.getMinThreshold());
            if (req.getStatus() != null) existing.setStatus(req.getStatus());
            if (req.getIsDeleted() != null) existing.setIsDeleted(req.getIsDeleted());
            if (req.getSpecifications() != null) existing.setSpecifications(req.getSpecifications());
            if (req.getImageUrl() != null) existing.setImageUrl(req.getImageUrl());
            if (req.getHasImei() != null) existing.setHasImei(req.getHasImei());
            if (req.getWarrantyPeriod() != null) existing.setWarrantyPeriod(req.getWarrantyPeriod());
            auditLogService.saveLog(
                    LogConstant.Action.UPDATE_PRODUCT,
                    LogConstant.Entity.PRODUCT,
                    existing.getId().toString(),
                    LogConstant.Status.SUCCESS,
                    "Admin update product");
            productRepository.save(existing);
            return ProductMappingHelper.map(existing);
        });
    }

}
