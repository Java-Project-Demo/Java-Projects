package org.dawn.backend.service.warranty;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.Loggable;
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
import org.dawn.backend.exception.ApiException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.sales.OrderRepository;
import org.dawn.backend.repository.warranty.WarrantyRepository;
import org.dawn.backend.service.inventory.StockService;
import org.dawn.backend.utils.SecurityContext;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
@Service
public class WarrantyService {
    private final WarrantyRepository warrantyRepository;
    private final ProductItemRepository itemRepository;
    private final OrderRepository orderRepository;
    private final StockService stockService;

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

    @Loggable(
            action = LogConstant.Action.RECEIVE_WARRANTY,
            entity = LogConstant.Entity.WARRANTY_CLAIM,
            message = "'Take warranty for ' + #req.imeis.size() + ' items'"
    )
    @Transactional
    public List<Warranty> createClaim(CreateWarrantyRequest req) {
        if (req.getImeis() == null || req.getImeis().isEmpty()) {
            throw new ApiException(Message.Exception.RETURN_IMEI_LIST_EMPTY);
        }
        List<Warranty> savedClaims = new ArrayList<>();
        Long currentUserId = SecurityContext.getCurrentUserId();
        for (String imei : req.getImeis()) {
            ProductItem item = itemRepository
                    .findByImei(imei)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

            if (item.getOrderId() == null || item.getWarrantyExpiryDate() == null) {
                throw new ApiException(Message.Exception.PRODUCT_NOT_SOLD);
            }

            if (item.getWarrantyExpiryDate().isBefore(Instant.now())) {
                throw new ApiException(MessageFormat.format(Message.Exception.WARRANTY_EXPIRED, item.getWarrantyExpiryDate()));
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
        }
        return savedClaims;
    }

    @Transactional
    public Warranty updateStatus(UpdateWarrantyRequest req) {
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
    }
}
