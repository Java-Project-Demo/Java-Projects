package org.dawn.backend.service.inventory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.constant.catalog.ItemStatus;
import org.dawn.backend.constant.system.ActiveStatus;
import org.dawn.backend.constant.inventory.MovementType;
import org.dawn.backend.constant.sales.OrderStatus;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.inventory.ImportImeiRequest;
import org.dawn.backend.dto.catalog.ProductItemResponse;
import org.dawn.backend.dto.catalog.ProductResponse;
import org.dawn.backend.entity.*;
import org.dawn.backend.exception.wrapper.ResourceAlreadyExistedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.dto.catalog.ProductMappingHelper;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.catalog.ProductRepository;
import org.dawn.backend.repository.catalog.SupplierRepository;
import org.dawn.backend.repository.sales.OrderItemRepository;
import org.dawn.backend.repository.sales.OrderRepository;
import org.dawn.backend.repository.warehouse.StockMovementRepository;
import org.dawn.backend.repository.warehouse.WarehouseLocationRepository;
import org.dawn.backend.service.system.AuditLogService;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class StockService {

    private final ProductRepository productRepository;
    private final ProductItemRepository itemRepository;
    private final StockMovementRepository movementRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AuditLogService auditLogService;
    private final TransactionManager manager;
    private final WarehouseLocationRepository locationRepository;
    private final SupplierRepository supplierRepository;

    public ProductResponse importImei(ImportImeiRequest req) {
        return manager.execute(() -> {
            Product product = productRepository
                    .findById(req.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));

            if (!product.getHasImei()) {
                throw new RuntimeException(Message.Exception.PRODUCT_NOT_MANAGED_BY_IMEI);
            }
            if (req.getImeiList() == null || req.getImeiList().isEmpty()) {
                throw new RuntimeException(Message.Exception.IMEI_LIST_EMPTY);
            }
            if (req.getCostPrice() == null || req.getCostPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException(Message.Exception.COST_PRICE_INVALID);
            }
            locationRepository.findById(req.getLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format(Message.Exception.WAREHOUSE_LOCATION_NOT_FOUND, req.getLocationId())));
            supplierRepository.findById(req.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format(Message.Exception.SUPPLIER_NOT_FOUND_WITH_ID, req.getSupplierId())));

            List<ProductItem> itemsSaved = new ArrayList<>();
            for (String imei : req.getImeiList()) {
                if (itemRepository.existsByImei(imei))
                    throw new ResourceAlreadyExistedException(MessageFormat.format(Message.Exception.ITEM_IMEI_ALREADY_EXISTS, imei));

                itemsSaved.add(ProductItem
                        .builder()
                        .productId(req.getProductId())
                        .locationId(req.getLocationId())
                        .costPrice(req.getCostPrice())
                        .supplierId(req.getSupplierId())
                        .imei(imei)
                        .status(ItemStatus.AVAILABLE)
                        .build());
            }

            itemRepository.saveAll(itemsSaved);

            int importQty = req.getImeiList().size();
            product.setCurrentStock(product.getCurrentStock() + importQty);

            if (product.getStatus() == ActiveStatus.INACTIVE) {
                product.setStatus(ActiveStatus.ACTIVE);
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
        });
    }

    public ProductItemResponse exportByImei(Long orderId, String imei) {
        return manager.execute(() -> {
            Order order = orderRepository
                    .findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND));
            // Only export IMEI if order have PENDING or COMPLETE
            if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.COMPLETED) {
                throw new RuntimeException(Message.Exception.ORDER_STATUS_NOT_ALLOWED_EXPORT);
            }

            ProductItem item = itemRepository
                    .findByImei(imei)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

            if (orderId.equals(item.getOrderId()) && ItemStatus.SOLD.equals(item.getStatus())) {
                log.info("IMEI {} already exported for this order, skipping check", imei);
                return ProductMappingHelper.mapItem(item);
            }

            // Check IMEI exist in order
            List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
            int totalRequireQty = orderItems.stream()
                    .filter(oi -> oi.getProductId().equals(item.getProductId()))
                    .mapToInt(OrderItem::getQuantity)
                    .sum();

            if (totalRequireQty == 0) {
                throw new RuntimeException(MessageFormat.format(Message.Exception.ITEM_NOT_IN_ORDER, item.getImei()));
            }

            // Check export quantity
            long alreadyShipped = itemRepository.countByProductIdAndOrderId(item.getProductId(), orderId);

            if (alreadyShipped >= totalRequireQty) {
                throw new RuntimeException(Message.Exception.PRODUCT_EXPORT_ENOUGH);
            }


            if (item.getStatus() != ItemStatus.AVAILABLE) {
                throw new RuntimeException(Message.Exception.ITEM_STATUS_CONFLICT);
            }

            // Update IMEI to SOLD
            item.setStatus(ItemStatus.SOLD);
            item.setOrderId(orderId);
            item.setSoldDate(Instant.now());

            // Update warranty
            Product product = productRepository
                    .findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));
            long period = (product.getWarrantyPeriod() != null && product.getWarrantyPeriod() > 0) ? product.getWarrantyPeriod() : 12L;
            item.setWarrantyExpiryDate(Instant.now().plus(Duration.ofDays(period * 30)));


            ProductItem savedItem = itemRepository.save(item);


            // Save movement history
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
            // Auto complete order
            checkAndCompleteOrder(order);
            return ProductMappingHelper.mapItem(savedItem);
        });
    }


    public ProductItem markAsDamaged(String imei, String reason) {
        return manager.execute(() -> {
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
        });
    }

    public ProductItem returnProduct(String imei, String reason) {
        return manager.execute(() -> {
            ProductItem item = itemRepository
                    .findByImei(imei)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

            if (item.getStatus() != ItemStatus.SOLD) {
                throw new RuntimeException();
            }
            Long oldOrderId = item.getOrderId();
            item.setStatus(ItemStatus.AVAILABLE);
            item.setSoldDate(null);
            // Giữ orderId + warrantyExpiryDate để cho phép tạo bảo hành sau refund
            // (khách mua → trả → vẫn còn quyền bảo hành trong thời hạn).
            // Phân biệt "đang bán" vs "đã refund" dựa trên status (SOLD vs AVAILABLE).

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
        });
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
        // Update if IMEI quantity == order quantity
        if (shippedCount >= requiredCount) {
            order.setStatus(OrderStatus.COMPLETED);
            orderRepository.save(order);
            log.info("Order {} export completely, auto transform to COMPLETE", order.getId());
        }
    }
}
