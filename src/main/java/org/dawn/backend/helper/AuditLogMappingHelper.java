package org.dawn.backend.helper;

import org.dawn.backend.dto.response.AuditLogResponse;
import org.dawn.backend.entity.AuditLog;

public interface AuditLogMappingHelper {

    static AuditLogResponse map(AuditLog log) {
        return AuditLogResponse
                .builder()
                .id(log.getId())
                .userId(log.getUserId())
                .action(log.getAction())
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .status(log.getStatus())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }

}
