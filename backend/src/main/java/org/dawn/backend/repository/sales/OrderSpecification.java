package org.dawn.backend.repository.sales;

import org.dawn.backend.constant.sales.OrderStatus;
import org.dawn.backend.entity.Order;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

public class OrderSpecification {

    public static Specification<Order> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) return null;
            return cb.equal(root.get("status"), OrderStatus.valueOf(status));
        };
    }

    public static Specification<Order> fromDate(LocalDateTime startDate) {
        return (root, query, cb) -> {
            if (startDate == null) return null;
            return cb.equal(root.get("createdAt"), startDate.toInstant(ZoneOffset.UTC));
        };
    }

    public static Specification<Order> toDate(LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (endDate == null) return null;
            return cb.equal(root.get("createdAt"), endDate.toInstant(ZoneOffset.UTC));
        };
    }

    public static Specification<Order> build(String status, LocalDateTime startDate, LocalDateTime endDate) {
        return Specification
                .where(hasStatus(status))
                .and(fromDate(startDate))
                .and(toDate(endDate));
    }
}
