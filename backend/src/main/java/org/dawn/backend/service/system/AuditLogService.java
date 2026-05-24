package org.dawn.backend.service.system;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.Loggable;
import org.dawn.backend.config.web.response.ResponsePage;
import org.dawn.backend.dto.system.AuditLogMappingHelper;
import org.dawn.backend.dto.system.AuditLogResponse;
import org.dawn.backend.entity.AuditLog;
import org.dawn.backend.repository.system.AuditLogRepository;
import org.dawn.backend.repository.system.AuditLogSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;

@RequiredArgsConstructor
@Slf4j
@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public ResponsePage<AuditLogResponse> searchLogs(
            String userId,
            String action,
            String status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size) {

        Page<AuditLog> result = auditLogRepository.findAll(
                AuditLogSpecification.build(userId, action, status, startDate, endDate),
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );

        return ResponsePage.of(
                result.getContent().stream().map(AuditLogMappingHelper::map).toList(),
                page,
                size,
                result.getTotalElements());
    }

    @Async
    public void saveLogAsync(
            Loggable loggable,
            String entityId,
            Long userId,
            String username,
            String status,
            String details) {
        try {


            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .username(username)
                    .action(loggable.action())
                    .entityName(loggable.entity())
                    .entityId(entityId)
                    .status(status)
                    .details(details)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }

    @Transactional
    public void autoCleanLogs() {
        LocalDateTime threshold = LocalDateTime.now().minusMonths(6);
        log.info("Starting clean audit log before: {}", threshold);

        auditLogRepository.deleteOlderThan(Instant.from(threshold));
        log.info("Auto start clean Audit Log before: {}", threshold);
    }
}
