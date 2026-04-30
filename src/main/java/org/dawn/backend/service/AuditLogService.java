package org.dawn.backend.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.dto.response.AuditLogResponse;
import org.dawn.backend.entity.AuditLog;
import org.dawn.backend.helper.AuditLogMappingHelper;
import org.dawn.backend.repository.system.AuditLogRepository;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final TransactionManager manager;

    public List<AuditLogResponse> searchLogs(
            String userId,
            String action,
            String status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size) {

        return auditLogRepository.search(
                        userId,
                        action,
                        status,
                        startDate,
                        endDate,
                        page,
                        size)
                .stream()
                .map(AuditLogMappingHelper::map)
                .toList();
    }

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


    public void autoCleanLogs() {
        LocalDateTime threshold = LocalDateTime.now().minusMonths(6);
        log.info("Starting clean audit log before: {}", threshold);

        int deleteCount = auditLogRepository.deleteOlderThan(threshold);
        log.info("Auto start clean Audit Log before: {}", threshold);
    }
}
