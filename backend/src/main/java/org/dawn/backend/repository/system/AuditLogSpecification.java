package org.dawn.backend.repository.system;

import org.dawn.backend.entity.AuditLog;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

public class AuditLogSpecification {

    public static Specification<AuditLog> hasUserId(String userId) {
        return (root, query, cb) -> {
            if (userId == null || userId.isBlank()) return null;
            return cb.equal(root.get("userId"), Long.valueOf(userId));
        };
    }

    public static Specification<AuditLog> hasAction(String action) {
        return (root, query, cb) -> {
            if (action == null || action.isBlank()) return null;
            return cb.equal(root.get("action"), action);
        };
    }

    public static Specification<AuditLog> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            return cb.equal(root.get("status"), status);
        };
    }


    public static Specification<AuditLog> fromDate(LocalDateTime startDate) {
        return (root, query, cb) -> {
            if (startDate == null) return null;
            return cb.equal(root.get("createdAt"), startDate.toInstant(ZoneOffset.UTC));
        };
    }

    public static Specification<AuditLog> toDate(LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (endDate == null) return null;
            return cb.equal(root.get("createdAt"), endDate.toInstant(ZoneOffset.UTC));
        };
    }

    public static Specification<AuditLog> build(String userId, String action, String status, LocalDateTime startDate, LocalDateTime endDate) {
        return Specification
                .where(hasUserId(userId))
                .and(hasAction(action))
                .and(hasAction(status))
                .and(fromDate(startDate))
                .and(toDate(endDate));
    }
}
