package org.dawn.backend.service.inventory;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.Loggable;
import org.dawn.backend.constant.catalog.ItemStatus;
import org.dawn.backend.constant.inventory.MovementType;
import org.dawn.backend.constant.sales.OrderStatus;
import org.dawn.backend.constant.system.ActiveStatus;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.catalog.ProductItemResponse;
import org.dawn.backend.dto.catalog.ProductMappingHelper;
import org.dawn.backend.dto.catalog.ProductResponse;
import org.dawn.backend.dto.inventory.ImportImeiRequest;
import org.dawn.backend.entity.*;
import org.dawn.backend.exception.ApiException;
import org.dawn.backend.exception.wrapper.InvalidRequestException;
import org.dawn.backend.exception.wrapper.ResourceAlreadyExistedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.catalog.ProductRepository;
import org.dawn.backend.repository.catalog.SupplierRepository;
import org.dawn.backend.repository.sales.OrderItemRepository;
import org.dawn.backend.repository.sales.OrderRepository;
import org.dawn.backend.repository.warehouse.StockMovementRepository;
import org.dawn.backend.repository.warehouse.WarehouseLocationRepository;
import org.dawn.backend.utils.SecurityContext;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
@Service
public class StockService {

    private final ProductRepository productRepository;
    private final ProductItemRepository itemRepository;
    private final StockMovementRepository movementRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final WarehouseLocationRepository locationRepository;
    private final SupplierRepository supplierRepository;

    @Loggable(
            action = LogConstant.Action.IMPORT_STOCK,
            entity = LogConstant.Entity.PRODUCT_ITEM,
            entityId = "#result?.id",
            message = "'Import IMEI'"
    )
    @Transactional
    public ProductResponse importImei(ImportImeiRequest req) {

        Product product = productRepository
                .findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));

        if (!product.getHasImei()) {
            throw new ApiException(Message.Exception.PRODUCT_NOT_MANAGED_BY_IMEI);
        }
        if (req.getImeiList() == null || req.getImeiList().isEmpty()) {
            throw new ApiException(Message.Exception.IMEI_LIST_EMPTY);
        }
        if (req.getCostPrice() == null || req.getCostPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(Message.Exception.COST_PRICE_INVALID);
        }
        WarehouseLocation location = locationRepository
                .findById(req.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format(Message.Exception.WAREHOUSE_LOCATION_NOT_FOUND, req.getLocationId())));
        if (locationRepository.hasOtherProductInLocation(req.getLocationId(), req.getProductId())) {
            throw new InvalidRequestException(MessageFormat.format(Message.Exception.LOCATION_HAS_OTHER_PRODUCT, req.getLocationId()));
        }

        long currentCount = locationRepository.countAvailableItemsByLocationId(req.getLocationId());
        long remaining = location.getCapacity() - currentCount;
        int incoming = req.getImeiList().size();
        if (incoming > remaining) {
            throw new InvalidRequestException(MessageFormat.format(Message.Exception.BIN_CAPACITY_EXCEEDED, remaining, incoming));
        }

        supplierRepository.findById(req.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format(Message.Exception.SUPPLIER_NOT_FOUND_WITH_ID, req.getSupplierId())));


        List<String> duplicates = req.getImeiList()
                .stream()
                .filter(itemRepository::existsByImei)
                .toList();
        if (!duplicates.isEmpty()) {
            throw new ResourceAlreadyExistedException(MessageFormat.format(Message.Exception.ITEM_IMEI_ALREADY_EXISTS, String.join(", ", duplicates)));
        }

        List<ProductItem> items = req.getImeiList()
                .stream()
                .map(imei -> ProductItem
                        .builder()
                        .productId(req.getProductId())
                        .locationId(req.getLocationId())
                        .costPrice(req.getCostPrice())
                        .supplierId(req.getSupplierId())
                        .imei(imei)
                        .status(ItemStatus.AVAILABLE)
                        .build())
                .collect(Collectors.toList());
        itemRepository.saveAll(items);

        product.setCurrentStock(product.getCurrentStock() + incoming);

        if (product.getStatus() == ActiveStatus.INACTIVE) {
            product.setStatus(ActiveStatus.ACTIVE);
        }

        Product savedProduct = productRepository.save(product);
        Long currentId = SecurityContext.getCurrentUserId();

        saveMovement(
                req.getProductId(),
                MovementType.IMPORT,
                "NEW_IMPORT",
                incoming,
                null,
                currentId,
                ""
        );
        return ProductMappingHelper.map(savedProduct);
    }

    @Loggable(
            action = LogConstant.Action.ADJUST_STOCK,
            entity = LogConstant.Entity.PRODUCT_ITEM,
            entityId = "#imei",
            message = "'Export IMEI'"
    )
    @Transactional
    public ProductItemResponse exportByImei(Long orderId, String imei) {

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND));
        // Only export IMEI if order have PENDING or COMPLETE
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.COMPLETED) {
            throw new ApiException(Message.Exception.ORDER_STATUS_NOT_ALLOWED_EXPORT);
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
            throw new ApiException(MessageFormat.format(Message.Exception.ITEM_NOT_IN_ORDER, item.getImei()));
        }

        // Check export quantity
        long alreadyShipped = itemRepository.countByProductIdAndOrderId(item.getProductId(), orderId);

        if (alreadyShipped >= totalRequireQty) {
            throw new ApiException(Message.Exception.PRODUCT_EXPORT_ENOUGH);
        }


        if (item.getStatus() != ItemStatus.AVAILABLE) {
            throw new ApiException(Message.Exception.ITEM_STATUS_CONFLICT);
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
        UserDetailsImpl currentUser = SecurityContext.getCurrentUser();
        Long currentId = (currentUser != null) ? currentUser.getId() : null;
        saveMovement(
                item.getProductId(),
                MovementType.EXPORT,
                "SALE_EXPORT",
                1,
                orderId,
                currentId,
                ""
        );
        // Auto complete order
        checkAndCompleteOrder(order);
        return ProductMappingHelper.mapItem(savedItem);
    }

    @Loggable(
            action = LogConstant.Action.MARK_DAMAGED,
            entity = LogConstant.Entity.PRODUCT_ITEM,
            entityId = "#imei",
            message = "'Error reason: ' + #reason"
    )
    @Transactional
    public ProductItem markAsDamaged(String imei, String reason) {

        UserDetailsImpl currentUser = SecurityContext.getCurrentUser();
        Long currentId = (currentUser != null) ? currentUser.getId() : null;

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
        return itemRepository.save(item);
    }

    @Loggable(
            action = LogConstant.Action.RETURN_ORDER,
            entity = LogConstant.Entity.PRODUCT_ITEM,
            entityId = "#imei",
            message = "'Return from client'"
    )
    @Transactional
    public ProductItem returnProduct(String imei, String reason) {

        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

        if (item.getStatus() != ItemStatus.SOLD) {
            throw new ApiException("Status not match");
        }
        Long oldOrderId = item.getOrderId();
        item.setStatus(ItemStatus.AVAILABLE);
        item.setSoldDate(null);
        // Giữ orderId + warrantyExpiryDate để cho phép tạo bảo hành sau refund
        // (khách mua → trả → vẫn còn quyền bảo hành trong thời hạn).
        // Phân biệt "đang bán" vs "đã refund" dựa trên status (SOLD vs AVAILABLE).

        productRepository.addStock(item.getProductId(), 1);

        UserDetailsImpl currentUser = SecurityContext.getCurrentUser();
        Long currentId = (currentUser != null) ? currentUser.getId() : null;
        saveMovement(
                item.getProductId(),
                MovementType.IMPORT,
                "RETURN_IMPORT",
                1,
                oldOrderId,
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
