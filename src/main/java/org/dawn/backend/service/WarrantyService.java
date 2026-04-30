package org.dawn.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.constant.LogConstant;
import org.dawn.backend.constant.Message;
import org.dawn.backend.constant.WarrantyStatus;
import org.dawn.backend.dto.request.CreateWarrantyRequest;
import org.dawn.backend.dto.request.UpdateWarrantyRequest;
import org.dawn.backend.entity.Order;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.entity.Warranty;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.sales.OrderRepository;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.warranty.WarrantyRepository;

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

    public List<Warranty> createClaim(CreateWarrantyRequest req) {
        return manager.execute(() -> {
            if (req.getImeis() == null || req.getImeis().isEmpty()) {
                throw new RuntimeException("Return IMEI list do not empty");
            }
            List<Warranty> savedClaims = new ArrayList<>();
            Long currentUserId = SecurityContext.get().id();
            for (String imei : req.getImeis()) {
                ProductItem item = itemRepository
                        .findByImei(imei)
                        .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

                if (item.getOrderId() == null || item.getWarrantyExpiryDate() == null) {
                    throw new RuntimeException("This product is not active (not sold)");
                }

                if (item.getWarrantyExpiryDate().isBefore(Instant.now())) {
                    throw new RuntimeException("This product is out of date warranty in " + item.getWarrantyExpiryDate());
                }

                Order order = orderRepository
                        .findById(item.getOrderId())
                        .orElseThrow(() -> new ResourceNotFoundException("Can not find order of product: " + imei));

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
                    .orElseThrow(() -> new ResourceNotFoundException("Can not find warranty ticket"));

            claim.setStatus(req.getStatus());

            if (req.getTechnicalNote() != null) {
                claim.setIssueDescription(claim.getIssueDescription() + "\nTech Note: " + req.getTechnicalNote());
            }

            if (WarrantyStatus.RETURNED.equals(req.getStatus())) {
                claim.setReturnDate(Instant.now());
            }

            if (WarrantyStatus.UNFIXABLE.equals(req.getStatus())) {
                ProductItem item = itemRepository
                        .findById(claim.getProductItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
                stockService.markAsDamaged(item.getImei(), "Unfixable warranty claim: " + req.getTechnicalNote());
            }

            return warrantyRepository.save(claim);
        });
    }
}
