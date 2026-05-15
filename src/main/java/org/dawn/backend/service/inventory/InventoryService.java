package org.dawn.backend.service.inventory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.constant.inventory.DetailStatus;
import org.dawn.backend.constant.inventory.SessionStatus;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.entity.InventoryDetail;
import org.dawn.backend.entity.InventorySession;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.warehouse.InventoryDetailRepository;
import org.dawn.backend.repository.warehouse.InventorySessionRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
public class InventoryService {
    private final InventorySessionRepository sessionRepository;
    private final InventoryDetailRepository detailRepository;
    private final ProductItemRepository itemRepository;
    private final TransactionManager manager;

    public Long startSession() {
        return manager.execute(() -> {
            InventorySession session = InventorySession.builder()
                    .createdBy(SecurityContext.get().id())
                    .status(SessionStatus.IN_PROGRESS)
                    .startDate(Instant.now())
                    .build();

            return sessionRepository.save(session).getId();
        });
    }

    public void recordScan(Long sessionId, String imei, Long actualLocId) {
        manager.execute(() -> {
            Optional<ProductItem> itemOpt = itemRepository.findByImei(imei);
            DetailStatus status = DetailStatus.MATCH;
            Long expectedLoc = null;

            if (itemOpt.isEmpty()) {
                status = DetailStatus.EXTRA;
            } else {
                ProductItem item = itemOpt.get();
                expectedLoc = item.getLocationId();
                if (!actualLocId.equals(expectedLoc)) {
                    status = DetailStatus.MISMATCH;
                }
            }

            InventoryDetail detail = InventoryDetail.builder()
                    .sessionId(sessionId)
                    .imei(imei)
                    .expectedLoc(expectedLoc)
                    .actualLoc(actualLocId)
                    .recordStatus(status)
                    .build();
            detailRepository.save(detail);
            return null;
        });
    }

    public void completeSession(Long sessionId) {
        manager.execute(() -> {
            List<String> missingImeis = itemRepository.findMissingImeis(sessionId);
            List<InventoryDetail> missingDetails = new ArrayList<>();
            for (String imei : missingImeis) {
                ProductItem item = itemRepository.findByImei(imei).get();
                missingDetails.add(InventoryDetail
                        .builder()
                        .sessionId(sessionId)
                        .imei(imei)
                        .expectedLoc(item.getLocationId())
                        .recordStatus(DetailStatus.MISSING)
                        .build());
            }

            if (!missingDetails.isEmpty()) {
                detailRepository.saveAll(missingDetails);
            }

            InventorySession session = sessionRepository
                    .findById(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.SESSION_NOT_FOUND));
            session.setStatus(SessionStatus.COMPLETED);
            session.setEndDate(Instant.now());
            sessionRepository.save(session);
            return null;
        });
    }

}
