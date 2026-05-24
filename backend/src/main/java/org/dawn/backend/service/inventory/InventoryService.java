package org.dawn.backend.service.inventory;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.inventory.DetailStatus;
import org.dawn.backend.constant.inventory.SessionStatus;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.inventory.InventorySessionResponse;
import org.dawn.backend.dto.inventory.ScanResultResponse;
import org.dawn.backend.dto.inventory.SessionSummaryResponse;
import org.dawn.backend.entity.*;
import org.dawn.backend.exception.wrapper.InvalidRequestException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.auth.UserRepository;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.warehouse.InventoryDetailRepository;
import org.dawn.backend.repository.warehouse.InventorySessionRepository;
import org.dawn.backend.repository.warehouse.WarehouseLocationRepository;
import org.dawn.backend.repository.warehouse.WarehouseRepository;
import org.dawn.backend.utils.SecurityContext;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
@Service
public class InventoryService {
    private final InventorySessionRepository sessionRepository;
    private final InventoryDetailRepository detailRepository;
    private final ProductItemRepository itemRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseLocationRepository locationRepository;
    private final UserRepository userRepository;


    @Transactional
    public InventorySessionResponse startSession(Long warehouseId) {
        if (warehouseId == null) {
            throw new InvalidRequestException("Phải chọn kho trước khi mở phiên kiểm kê");
        }
        Warehouse warehouse = warehouseRepository
                .findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kho id=" + warehouseId));
        InventorySession session = InventorySession.builder()
                .warehouseId(warehouseId)
                .createdBy(SecurityContext.getCurrentUserId())
                .status(SessionStatus.IN_PROGRESS)
                .startDate(Instant.now())
                .build();
        InventorySession saved = sessionRepository.save(session);

        return toSessionResponse(saved, warehouse, SecurityContext.getCurrentUsername());

    }

    @Transactional
    public ScanResultResponse recordScan(Long sessionId, String imei, Long actualLocId) {
        InventorySession session = sessionRepository
                .findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.SESSION_NOT_FOUND));

        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new InvalidRequestException("Phiên kiểm kê đã đóng, không thể scan thêm");
        }

        WarehouseLocation actualLoc = locationRepository
                .findById(actualLocId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vị trí id=" + actualLocId));

        if (session.getWarehouseId() != null && !session.getWarehouseId().equals(actualLoc.getWarehouseId())) {
            throw new InvalidRequestException("Vị trí scan không thuộc kho của phiên kiểm kê");
        }

        Optional<ProductItem> itemOpt = itemRepository.findByImei(imei);
        DetailStatus status;
        Long expectedLocId = null;
        String expectedLocLabel = null;

        if (itemOpt.isEmpty()) {
            status = DetailStatus.EXTRA;
        } else {
            ProductItem item = itemOpt.get();
            expectedLocId = item.getLocationId();
            if (expectedLocId == null) {
                status = DetailStatus.EXTRA;
            } else if (Objects.equals(actualLocId, expectedLocId)) {
                status = DetailStatus.MATCH;
            } else {
                status = DetailStatus.MISMATCH;
                expectedLocLabel = locationRepository.findById(expectedLocId)
                        .map(this::labelOf)
                        .orElse(null);
            }
        }

        InventoryDetail detail = InventoryDetail.builder()
                .sessionId(sessionId)
                .imei(imei)
                .expectedLoc(expectedLocId)
                .actualLoc(actualLocId)
                .recordStatus(status)
                .build();
        InventoryDetail savedDetail = detailRepository.save(detail);

        return ScanResultResponse.builder()
                .detailId(savedDetail.getId())
                .imei(imei)
                .status(status.name())
                .expectedLocId(expectedLocId)
                .expectedLocLabel(expectedLocLabel)
                .actualLocId(actualLocId)
                .actualLocLabel(labelOf(actualLoc))
                .build();
    }

    @Transactional
    public SessionSummaryResponse completeSession(Long sessionId) {
        InventorySession session = sessionRepository
                .findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.SESSION_NOT_FOUND));

        // Find missing IMEIs scoped by warehouse, then persist as MISSING details
        if (session.getWarehouseId() != null) {
            List<String> missingImeis = itemRepository
                    .findMissingImeisByWarehouse(sessionId, session.getWarehouseId());
            List<InventoryDetail> missingDetails = new ArrayList<>();
            for (String imei : missingImeis) {
                ProductItem item = itemRepository.findByImei(imei).orElse(null);
                if (item == null) continue;
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
        }

        session.setStatus(SessionStatus.COMPLETED);
        session.setEndDate(Instant.now());
        InventorySession saved = sessionRepository.save(session);

        return buildSummary(saved);
    }

    public SessionSummaryResponse getSummary(Long sessionId) {
        InventorySession session = sessionRepository
                .findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.SESSION_NOT_FOUND));
        return buildSummary(session);
    }


    private SessionSummaryResponse buildSummary(InventorySession session) {
        List<InventoryDetail> details = detailRepository.findBySessionId(session.getId());

        // Preload location labels in one pass
        Map<Long, String> locLabels = new HashMap<>();
        if (session.getWarehouseId() != null) {
            for (WarehouseLocation l : locationRepository.findByWarehouseId(session.getWarehouseId())) {
                locLabels.put(l.getId(), labelOf(l));
            }
        }

        int match = 0, mismatch = 0, missing = 0, extra = 0;
        List<ScanResultResponse> rows = new ArrayList<>();
        for (InventoryDetail d : details) {
            switch (d.getRecordStatus()) {
                case MATCH -> match++;
                case MISMATCH -> mismatch++;
                case MISSING -> missing++;
                case EXTRA -> extra++;
            }
            rows.add(ScanResultResponse.builder()
                    .detailId(d.getId())
                    .imei(d.getImei())
                    .status(d.getRecordStatus().name())
                    .expectedLocId(d.getExpectedLoc())
                    .expectedLocLabel(d.getExpectedLoc() != null ? locLabels.get(d.getExpectedLoc()) : null)
                    .actualLocId(d.getActualLoc())
                    .actualLocLabel(d.getActualLoc() != null ? locLabels.get(d.getActualLoc()) : null)
                    .note(d.getNote())
                    .build());
        }

        Warehouse warehouse = session.getWarehouseId() == null ? null
                : warehouseRepository.findById(session.getWarehouseId()).orElse(null);
        String createdByUsername = userRepository
                .findById(session.getCreatedBy())
                .map(User::getUsername)
                .orElse(null);

        return SessionSummaryResponse.builder()
                .session(toSessionResponse(session, warehouse, createdByUsername))
                .matchCount(match)
                .mismatchCount(mismatch)
                .missingCount(missing)
                .extraCount(extra)
                .details(rows)
                .build();
    }

    private InventorySessionResponse toSessionResponse(InventorySession session, Warehouse warehouse, String createdByUsername) {
        return InventorySessionResponse.builder()
                .id(session.getId())
                .warehouseId(session.getWarehouseId())
                .warehouseName(warehouse != null ? warehouse.getName() : null)
                .warehouseAddress(warehouse != null ? warehouse.getAddress() : null)
                .createdBy(session.getCreatedBy())
                .createdByUsername(createdByUsername)
                .status(session.getStatus() != null ? session.getStatus().name() : null)
                .startDate(session.getStartDate())
                .endDate(session.getEndDate())
                .build();
    }

    private String labelOf(WarehouseLocation loc) {
        StringBuilder sb = new StringBuilder();
        appendPart(sb, loc.getZoneName());
        appendPart(sb, loc.getRowNum());
        appendPart(sb, loc.getShelfNum());
        appendPart(sb, loc.getBinNum());
        if (sb.isEmpty()) return "#" + loc.getId();
        return sb.toString();
    }

    private void appendPart(StringBuilder sb, String part) {
        if (part == null || part.isBlank()) return;
        if (!sb.isEmpty()) sb.append(" · ");
        sb.append(part);
    }
}
