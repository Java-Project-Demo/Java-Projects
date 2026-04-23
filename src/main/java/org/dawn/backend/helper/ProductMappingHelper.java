package org.dawn.backend.helper;

import org.dawn.backend.dto.request.ProductRequest;
import org.dawn.backend.dto.response.ProductItemResponse;
import org.dawn.backend.dto.response.ProductResponse;
import org.dawn.backend.entity.Product;
import org.dawn.backend.entity.ProductItem;

public interface ProductMappingHelper {
    static Product map(ProductRequest req) {
        return Product.builder()
                .sku(req.getSku())
                .categoryId(req.getCategoryId())
                .name(req.getName())
                .priceImport(req.getPriceImport())
                .priceExport(req.getPriceExport())
                .hasImei(req.getHasImei())
                .currentStock(req.getCurrentStock())
                .minThreshold(req.getMinThreshold())
                .specifications(req.getSpecifications())
                .status(req.getStatus())
                .isDeleted(req.getIsDeleted())
                .build();
    }

    static ProductResponse map(Product req) {
        return ProductResponse
                .builder()
                .id(req.getId())
                .categoryId(req.getCategoryId())
                .sku(req.getSku())
                .name(req.getName())
                .priceImport(req.getPriceImport())
                .priceExport(req.getPriceExport())
                .currentStock(req.getCurrentStock())
                .minThreshold(req.getMinThreshold())
                .specifications(req.getSpecifications())
                .isDeleted(req.getIsDeleted())
                .status(req.getStatus())
                .items(req
                        .getItems()
                        .stream()
                        .map(ProductMappingHelper::mapItem)
                        .toList())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }

    static ProductItemResponse mapItem(ProductItem item) {
        return ProductItemResponse
                .builder()
                .id(item.getId())
                .imei(item.getImei())
                .status(item.getStatus())
                .importDate(item.getImportDate())
                .soldDate(item.getSoldDate())
                .build();
    }
}
