package org.dawn.backend.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.constant.*;
import org.dawn.backend.dto.request.ProductRequest;
import org.dawn.backend.dto.response.ProductResponse;
import org.dawn.backend.entity.Order;
import org.dawn.backend.entity.Product;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.entity.StockMovement;
import org.dawn.backend.exception.wrapper.ResourceAlreadyExistedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.helper.ProductMappingHelper;
import org.dawn.backend.repository.*;

import java.time.Instant;
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
        Product product = productRepository.save(ProductMappingHelper.map(req));
        auditLogService.saveLog(
                LogConstant.Action.CREATE_PRODUCT,
                LogConstant.Entity.PRODUCT,
                product.getId().toString(),
                LogConstant.Status.SUCCESS,
                "Admin create product");
        return ProductMappingHelper.map(product);
    }


    public ProductResponse updateProduct(Long id, ProductRequest product) {
        Product existing = productRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));
        existing.setName(product.getName());
        auditLogService.saveLog(
                LogConstant.Action.CREATE_PRODUCT,
                LogConstant.Entity.PRODUCT,
                existing.getId().toString(),
                LogConstant.Status.SUCCESS,
                "Admin update product");
        return ProductMappingHelper.map(existing);
    }


    public Product importImeis(Long productId, List<String> imeiList) {
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));

        for (String imei : imeiList) {
            if (itemRepository.existsByImei(imei))
                throw new ResourceAlreadyExistedException("ITEM " + imei + " already exists");

            itemRepository.save(ProductItem
                    .builder()
                    .productId(productId)
                    .imei(imei)
                    .status(ItemStatus.AVAILABLE)
                    .build());
        }


        productRepository.addStock(productId, imeiList.size());

        UserPrincipal currentUser = SecurityContext.get();
        Long currentId = (currentUser != null) ? currentUser.id() : null;
        saveMovement(
                productId,
                MovementType.IMPORT,
                "NEW_IMPORT",
                imeiList.size(),
                null,
                currentId,
                "Import IMEI"
        );

        auditLogService.saveLog(
                LogConstant.Action.IMPORT_STOCK,
                LogConstant.Entity.PRODUCT_ITEM,
                product.getId().toString(),
                LogConstant.Status.SUCCESS,
                "Stock import IMEI");
        return product;
    }

    public ProductItem exportByImei(Long orderId, String imei) {
        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only order have PENDING can be export");
        }

        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

        if (item.getStatus() != ItemStatus.AVAILABLE) {
            throw new RuntimeException("Status conflict");
        }


        item.setStatus(ItemStatus.SOLD);
        item.setOrderId(orderId);
        item.setSoldDate(Instant.now());
        ProductItem savedItem = itemRepository.save(item);

        productRepository.subtractStock(item.getProductId(), 1);
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
        return savedItem;
    }


    public ProductItem markAsDamaged(String imei, String reason) {
        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));
        item.setStatus(ItemStatus.DAMAGED);

        productRepository.subtractStock(item.getProductId(), 1);

        UserPrincipal currentUser = SecurityContext.get();
        Long currentId = (currentUser != null) ? currentUser.id() : null;
        saveMovement(
                item.getProductId(),
                MovementType.ADJUST,
                "DAMAGE_ADJUST",
                1,
                null,
                currentId,
                reason
        );
        return itemRepository.save(item);
    }

    public ProductItem returnProduct(String imei, String reason) {
        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

        if (item.getStatus() != ItemStatus.SOLD) {
            throw new RuntimeException();
        }

        item.setStatus(ItemStatus.AVAILABLE);
        item.setSoldDate(null);
        item.setOrderId(null);

        productRepository.addStock(item.getProductId(), 1);

        UserPrincipal currentUser = SecurityContext.get();
        Long currentId = (currentUser != null) ? currentUser.id() : null;
        saveMovement(
                item.getProductId(),
                MovementType.IMPORT,
                "RETURN_IMPORT",
                1,
                null,
                currentId,
                "Client return :" + reason
        );

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

    private void checkAndCompleteOrder(Order order) {
        long shippedCount = itemRepository.countByOrderId(order.getId());
        long requiredCount = orderItemRepository.getTotalQuantityByOrderId(order.getId());

        if (shippedCount >= requiredCount) {
            order.setStatus(OrderStatus.COMPLETED);
            orderRepository.save(order);
            log.info("Order {} export completely, auto transform to COMPLETE", order.getId());
        }
    }
}
