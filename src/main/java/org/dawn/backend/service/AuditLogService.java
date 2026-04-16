package org.dawn.backend.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.dto.response.AuditLogResponse;
import org.dawn.backend.helper.AuditLogMappingHelper;
import org.dawn.backend.repository.AuditLogRepository;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public List<AuditLogResponse> searchLogs(
            String userId,
            String action,
            String status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size) {

        return auditLogRepository.search(userId, action, status, startDate, endDate, page, size).stream().map(AuditLogMappingHelper::map).toList();
    }


    public void autoCleanLogs() {
        LocalDateTime threshold = LocalDateTime.now().minusMonths(6);
        log.info("Starting clean audit log before: {}", threshold);

        int deleteCount = auditLogRepository.deleteOlderThan(threshold);
        log.info("Auto start clean Audit Log before: {}", threshold);
    }
}
