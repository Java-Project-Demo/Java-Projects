package org.dawn.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.constant.LogConstant;
import org.dawn.backend.constant.Message;
import org.dawn.backend.dto.request.ProductRequest;
import org.dawn.backend.dto.response.ProductResponse;
import org.dawn.backend.entity.Product;
import org.dawn.backend.exception.wrapper.ResourceAlreadyExistedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.helper.ProductMappingHelper;
import org.dawn.backend.repository.catalog.ProductRepository;

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


    public ProductResponse updateProduct(Long id, ProductRequest req) {
        return manager.execute(() -> {
            Product existing = productRepository
                    .findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));
            existing.setName(req.getName());
            existing.setCategoryId(req.getCategoryId());
            existing.setPriceImport(req.getPriceImport());
            existing.setPriceExport(req.getPriceExport());
            existing.setMinThreshold(req.getMinThreshold());
            existing.setStatus(req.getStatus());
            existing.setIsDeleted(req.getIsDeleted());
            existing.setSpecifications(req.getSpecifications());
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
