package org.dawn.backend.service.system;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.config.web.response.ResponsePage;
import org.dawn.backend.dto.system.AuditLogMappingHelper;
import org.dawn.backend.dto.system.AuditLogResponse;
import org.dawn.backend.entity.AuditLog;
import org.dawn.backend.repository.system.AuditLogRepository;
import org.dawn.backend.repository.system.AuditLogSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

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

    @Transactional
    public void saveLog(String action, String entityName, String entityId, String status, String details) {
        UserPrincipal currentUser = SecurityContext.get();
        log.info("Get current user: {}", currentUser);
        Long userId = (currentUser != null) ? currentUser.id() : 0L;

        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .status(status)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    @Transactional
    public void saveLog(Long userId, String action, String entityName, String entityId, String status, String details) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .status(status)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    @Transactional
    public void autoCleanLogs() {
        LocalDateTime threshold = LocalDateTime.now().minusMonths(6);
        log.info("Starting clean audit log before: {}", threshold);

        auditLogRepository.deleteOlderThan(Instant.from(threshold));
        log.info("Auto start clean Audit Log before: {}", threshold);
    }
}
