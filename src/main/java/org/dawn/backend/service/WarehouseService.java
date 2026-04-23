package org.dawn.backend.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.constant.*;
import org.dawn.backend.dto.request.ImportImeiRequest;
import org.dawn.backend.dto.request.ProductRequest;
import org.dawn.backend.dto.response.ProductItemResponse;
import org.dawn.backend.dto.response.ProductResponse;
import org.dawn.backend.entity.*;
import org.dawn.backend.exception.wrapper.ResourceAlreadyExistedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.helper.ProductMappingHelper;
import org.dawn.backend.repository.*;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class WarehouseService {

    private final ProductRepository productRepository;

    private final ProductItemRepository itemRepository;

    private final StockMovementRepository movementRepository;

    private final OrderRepository orderRepository;

    private final OrderItemRepository orderItemRepository;

    private final AuditLogService auditLogService;

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
    }


    public ProductResponse updateProduct(Long id, ProductRequest req) {
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
    }


    public ProductResponse importImei(ImportImeiRequest req) {
        Product product = productRepository
                .findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));

        if (!product.getHasImei()) {
            throw new RuntimeException("This product don't manager by IMEI code");
        }
        List<ProductItem> itemsSaved = new ArrayList<>();
        for (String imei : req.getImeiList()) {
            if (itemRepository.existsByImei(imei))
                throw new ResourceAlreadyExistedException("ITEM " + imei + " already exists");

            itemsSaved.add(ProductItem
                    .builder()
                    .productId(req.getProductId())
                    .costPrice(req.getCostPrice())
                    .supplierName(req.getSupplier())
                    .imei(imei)
                    .status(ItemStatus.AVAILABLE)
                    .build());
        }

        itemRepository.saveAll(itemsSaved);

        int importQty = req.getImeiList().size();
        product.setCurrentStock(product.getCurrentStock() + importQty);

        if (product.getStatus() == ProductStatus.INACTIVE) {
            product.setStatus(ProductStatus.ACTIVE);
        }

        Product savedProduct = productRepository.save(product);

        UserPrincipal currentUser = SecurityContext.get();
        Long currentId = (currentUser != null) ? currentUser.id() : null;

        saveMovement(
                req.getProductId(),
                MovementType.IMPORT,
                "NEW_IMPORT",
                req.getImeiList().size(),
                null,
                currentId,
                "Import IMEI"
        );

        auditLogService.saveLog(
                LogConstant.Action.IMPORT_STOCK,
                LogConstant.Entity.PRODUCT_ITEM,
                savedProduct.getId().toString(),
                LogConstant.Status.SUCCESS,
                "Stock import IMEI");
        return ProductMappingHelper.map(savedProduct);
    }

    public ProductItemResponse exportByImei(Long orderId, String imei) {
        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only order have PENDING can be export");
        }

        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

        // Check IMEI exist in order
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        boolean isProductInOrder = orderItems
                .stream()
                .anyMatch(oi -> oi
                        .getProductId()
                        .equals(item.getProductId()));

        if (!isProductInOrder) {
            throw new RuntimeException("This IMEI do not belong to list product in order");
        }

        long alreadyShipped = itemRepository.countByProductIdAndOrderId(item.getProductId(), orderId);
        int requireQty = orderItems
                .stream()
                .filter(oi -> oi
                        .getProductId()
                        .equals(item.getProductId()))
                .findFirst()
                .get()
                .getQuantity();

        if (alreadyShipped >= requireQty) {
            throw new RuntimeException("This product was export enough quantity in this order");
        }


        if (item.getStatus() != ItemStatus.AVAILABLE) {
            throw new RuntimeException("Status conflict");
        }

        Product product = productRepository
                .findById(item.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));
        item.setStatus(ItemStatus.SOLD);
        item.setOrderId(orderId);
        item.setSoldDate(Instant.now());
        long period = (product.getWarrantyPeriod() != null && product.getWarrantyPeriod() > 0) ? product.getWarrantyPeriod() : 12L;
        item.setWarrantyExpiryDate(Instant.now().plus(Duration.ofDays(period * 30)));
        product.setCurrentStock(product.getCurrentStock() - 1);

        ProductItem savedItem = itemRepository.save(item);

        UserPrincipal currentUser = SecurityContext.get();
        Long currentId = (currentUser != null) ? currentUser.id() : null;
        saveMovement(
                item.getProductId(),
                MovementType.EXPORT,
                "SALE_EXPORT",
                1,
                orderId,
                currentId,
                "Export IMEI"
        );
        auditLogService.saveLog(
                LogConstant.Action.ADJUST_STOCK,
                LogConstant.Entity.PRODUCT_ITEM,
                imei,
                LogConstant.Status.SUCCESS,
                "Stock export IMEI");
        checkAndCompleteOrder(order);
        return ProductMappingHelper.mapItem(savedItem);
    }


    public ProductItem markAsDamaged(String imei, String reason) {
        UserPrincipal currentUser = SecurityContext.get();
        Long currentId = (currentUser != null) ? currentUser.id() : null;

        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

        if (item.getStatus() == ItemStatus.AVAILABLE) {
            productRepository.subtractStock(item.getProductId(), 1);
        }

        item.setStatus(ItemStatus.DAMAGED);

        saveMovement(
                item.getProductId(),
                MovementType.ADJUST,
                "DAMAGE_ADJUST",
                1,
                null,
                currentId,
                reason
        );
        auditLogService.saveLog(
                LogConstant.Action.MARK_DAMAGED,
                LogConstant.Entity.PRODUCT_ITEM,
                imei,
                LogConstant.Status.SUCCESS,
                "Error reason: " + reason);
        return itemRepository.save(item);
    }

    public ProductItem returnProduct(String imei, String reason) {
        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

        if (item.getStatus() != ItemStatus.SOLD) {
            throw new RuntimeException();
        }
        Long oldOrderId = item.getOrderId();
        item.setStatus(ItemStatus.AVAILABLE);
        item.setSoldDate(null);
        item.setOrderId(null);
        item.setWarrantyExpiryDate(null);

        productRepository.addStock(item.getProductId(), 1);

        UserPrincipal currentUser = SecurityContext.get();
        Long currentId = (currentUser != null) ? currentUser.id() : null;
        saveMovement(
                item.getProductId(),
                MovementType.IMPORT,
                "RETURN_IMPORT",
                1,
                oldOrderId,
                currentId,
                "Client return :" + reason
        );

        auditLogService.saveLog(
                LogConstant.Action.RETURN_ORDER,
                LogConstant.Entity.PRODUCT_ITEM,
                imei,
                LogConstant.Status.SUCCESS,
                "Return from client");

        return itemRepository.save(item);
    }

    public void saveMovement(Long pId, MovementType type, String action, Integer qty, Long ref, Long uId, String note) {
        movementRepository.save(StockMovement
                .builder()
                .productId(pId)
                .type(type)
                .actionType(action)
                .quantity(qty)
                .referenceId(ref)
                .createdBy(uId)
                .note(note)
                .build());
    }

    public void checkAndCompleteOrder(Order order) {
        long shippedCount = itemRepository.countByOrderId(order.getId());
        long requiredCount = orderItemRepository.getTotalQuantityByOrderId(order.getId());

        if (shippedCount >= requiredCount) {
            order.setStatus(OrderStatus.COMPLETED);
            orderRepository.save(order);
            log.info("Order {} export completely, auto transform to COMPLETE", order.getId());
        }
    }
}
