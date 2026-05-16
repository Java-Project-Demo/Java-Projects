package org.dawn.backend.dto.system;

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
                .staffName(log.getStaffName())
                .staffUsername(log.getStaffUsername())
                .createdAt(log.getCreatedAt())
                .build();
    }

}
