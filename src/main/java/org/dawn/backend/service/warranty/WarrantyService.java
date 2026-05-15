package org.dawn.backend.service.warranty;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.constant.warranty.WarrantyStatus;
import org.dawn.backend.dto.warranty.CreateWarrantyRequest;
import org.dawn.backend.dto.warranty.UpdateWarrantyRequest;
import org.dawn.backend.dto.warranty.WarrantyMappingHelper;
import org.dawn.backend.dto.warranty.WarrantyResponse;
import org.dawn.backend.entity.Order;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.entity.Warranty;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.sales.OrderRepository;
import org.dawn.backend.repository.warranty.WarrantyRepository;
import org.dawn.backend.service.inventory.StockService;
import org.dawn.backend.service.system.AuditLogService;

import java.text.MessageFormat;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class WarrantyService {
    private final WarrantyRepository warrantyRepository;
    private final ProductItemRepository itemRepository;
    private final OrderRepository orderRepository;
    private final AuditLogService auditLogService;
    private final StockService stockService;
    private final TransactionManager manager;

    public List<WarrantyResponse> getAll() {
        return warrantyRepository
                .findAll()
                .stream()
                .map(WarrantyMappingHelper::map)
                .toList();
    }

    public WarrantyResponse getOne(Long id) {
        return warrantyRepository
                .findById(id)
                .map(WarrantyMappingHelper::map)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.WARRANTY_NOT_FOUND));
    }

    public List<Warranty> createClaim(CreateWarrantyRequest req) {
        return manager.execute(() -> {
            if (req.getImeis() == null || req.getImeis().isEmpty()) {
                throw new RuntimeException(Message.Exception.RETURN_IMEI_LIST_EMPTY);
            }
            List<Warranty> savedClaims = new ArrayList<>();
            Long currentUserId = SecurityContext.get().id();
            for (String imei : req.getImeis()) {
                ProductItem item = itemRepository
                        .findByImei(imei)
                        .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

                if (item.getOrderId() == null || item.getWarrantyExpiryDate() == null) {
                    throw new RuntimeException(Message.Exception.PRODUCT_NOT_SOLD);
                }

                if (item.getWarrantyExpiryDate().isBefore(Instant.now())) {
                    throw new RuntimeException(MessageFormat.format(Message.Exception.WARRANTY_EXPIRED, item.getWarrantyExpiryDate()));
                }

                Order order = orderRepository
                        .findById(item.getOrderId())
                        .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format(Message.Exception.ORDER_NOT_FOUND_FOR_PRODUCT, imei)));

                Warranty claim = Warranty.builder()
                        .productItemId(item.getId())
                        .customerId(order.getCustomerId())
                        .createdBy(currentUserId)
                        .issueDescription(req.getIssue())
                        .status(WarrantyStatus.RECEIVED)
                        .build();

                Warranty saved = warrantyRepository.save(claim);
                savedClaims.add(saved);
                auditLogService.saveLog(
                        LogConstant.Action.RECEIVE_WARRANTY,
                        LogConstant.Entity.WARRANTY_CLAIM,
                        saved.getId().toString(),
                        LogConstant.Status.SUCCESS,
                        "Take warranty " + imei
                );
            }
            return savedClaims;
        });
    }

    public Warranty updateStatus(UpdateWarrantyRequest req) {
        return manager.execute(() -> {
            Warranty claim = warrantyRepository
                    .findById(req.getClaimId())
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.WARRANTY_TICKET_NOT_FOUND));

            claim.setStatus(req.getStatus());

            if (req.getTechnicalNote() != null) {
                claim.setIssueDescription(claim.getIssueDescription() + "Tech Note: " + req.getTechnicalNote());
            }

            if (WarrantyStatus.RETURNED.equals(req.getStatus())) {
                claim.setReturnDate(Instant.now());
            }

            if (WarrantyStatus.UNFIXABLE.equals(req.getStatus())) {
                ProductItem item = itemRepository
                        .findById(claim.getProductItemId())
                        .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));
                stockService.markAsDamaged(item.getImei(), "Unfixable warranty claim: " + req.getTechnicalNote());
            }

            return warrantyRepository.save(claim);
        });
    }
}
