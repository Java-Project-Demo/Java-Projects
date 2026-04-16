package org.dawn.backend.repository;

import org.dawn.backend.entity.AuditLog;
import org.dawn.backend.repository.base.BaseRepository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends BaseRepository<AuditLog, Long> {
    List<AuditLog> search(String userId, String action, String status, LocalDateTime startDate, LocalDateTime endDate, int page, int size);

    int deleteOlderThan(LocalDateTime threshold);
}
