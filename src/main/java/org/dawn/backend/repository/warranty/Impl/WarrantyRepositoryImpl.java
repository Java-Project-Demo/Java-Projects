package org.dawn.backend.repository.warranty.Impl;

import org.dawn.backend.constant.WarrantyStatus;
import org.dawn.backend.entity.Warranty;
import org.dawn.backend.repository.warranty.WarrantyRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public class WarrantyRepositoryImpl extends AbstractRepository<Warranty, Long> implements WarrantyRepository {
    public WarrantyRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<Warranty> findAll() {
        String sql = """
                SELECT w.*, pi.imei, c.full_name AS customer_name, u.full_name AS staff_name
                FROM warranty_claims w
                JOIN product_items pi ON w.product_item_id = pi.id
                JOIN customers c ON w.customer = c.id
                JOIN users u ON w.created_by = u.id
                ORDER BY w.received_date DESC
                """;
        return queryList(sql, this::mapResultSet);
    }


    @Override
    public Optional<Warranty> findById(Long id) {
        String sql = """
                SELECT w.*, pi.imei, c.full_name AS customer_name, u.full_name as staff_name
                FROM warranty_claims w
                JOIN product_items pi ON w.product_item_id = pi.id
                JOIN customers c ON w.customer = c.id
                JOIN users u ON w.created_by = u.id
                WHERE w.id = ?
                """;
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public List<Warranty> findByProductItemId(Long itemId) {
        String sql = """
                SELECT *
                FROM warranty_claims
                WHERE product_item_id = ?
                ORDER BY received_date DESC
                """;
        return queryList(sql, this::mapResultSet, itemId);
    }

    @Override
    public Long countByStatusNot(WarrantyStatus status) {
        String sql = "SELECT COUNT(*) FROM warranty_claims WHERE status <> ?";
        return count(sql, status.name());
    }

    @Override
    public Warranty save(Warranty entity) {
        Timestamp now = Timestamp.from(Instant.now());
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO warranty_claims
                    (product_item_id, customer_id, created_by, issue_description, status, received_date)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """;
            Long id = insert(sql,
                    entity.getProductItemId(),
                    entity.getCustomerId(),
                    entity.getCreatedBy(),
                    entity.getIssueDescription(),
                    WarrantyStatus.RECEIVED.name(),
                    now);
            entity.setId(id);
            entity.setReceivedDate(now.toInstant());
        } else {
            String sql = """
                    UPDATE warranty_claims
                    SET status = ?, return_date = ?, issue_description = ?
                    WHERE id = ?
                    """;
            Timestamp returnDate = WarrantyStatus.RETURNED.equals(entity.getStatus()) ? now : null;

            executeQuery(sql,
                    entity.getStatus(),
                    returnDate,
                    entity.getIssueDescription(),
                    entity.getId());
        }
        return entity;
    }

    private Warranty mapResultSet(ResultSet rs) throws SQLException {
        return Warranty
                .builder()
                .id(rs.getLong("id"))
                .productItemId(rs.getLong("product_item_id"))
                .customerId(rs.getLong("customer_id"))
                .createdBy(rs.getLong("created_by"))
                .issueDescription(rs.getString("issue_description"))
                .status(WarrantyStatus.valueOf(rs.getString("status")))
                .receivedDate(getInstant(rs, "received_date"))
                .returnDate(getInstant(rs, "return_date"))
                .build();
    }
}
