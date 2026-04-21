package org.dawn.backend.repository.Impl;

import org.dawn.backend.entity.WarrantyClaim;
import org.dawn.backend.repository.WarrantyClaimRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public class WarrantyClaimRepositoryImpl extends AbstractRepository<WarrantyClaim, Long> implements WarrantyClaimRepository {
    public WarrantyClaimRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<WarrantyClaim> findAll() {
        String sql = """
                SELECT w.*, pi.imei, c.full_name AS customer_name, u.full_name AS staff_name
                FROM warranty_claims w
                JOIN product_items pi ON w.product_item_id = pi.id
                JOIN customers c ON w.customer = c.id JOIN users ON w.created_by = u.id
                JOIN users u ON w.created_by = u.id
                ORDER BY w.received_date DESC
                """;
        return queryList(sql, this::mapResultSet);
    }


    @Override
    public Optional<WarrantyClaim> findById(Long id) {
        String sql = """
                SELECT w.*, pi.imei, c.full_name AS customer_name, u.full_name as staff_name
                FROM warranty_claims w
                JOIN product_items pi ON w.product_item_id = pi.id
                JOIN customers c ON w.customer = c.id JOIN users ON w.created_by = u.id
                WHERE w.id = ?
                """;
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public List<WarrantyClaim> findByProductItemId(Long itemId) {
        String sql = """
                SELECT *
                FROM warranty_claims
                WHERE product_item_id = ?
                ORDER BY received_date DESC
                """;
        return queryList(sql, this::mapResultSet, itemId);
    }

    @Override
    public WarrantyClaim save(WarrantyClaim entity) {
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
                    "RECEIVED",
                    now);
            entity.setId(id);
            entity.setReceivedDate(now.toInstant());
        } else {
            String sql = """
                    UPDATE warranty_claims
                    SET status = ?, return_date = ?, issue_description = ?
                    WHERE id = ?
                    """;
            Timestamp returnDate = "RETURNED".equals(entity.getStatus()) ? now : null;

            executeQuery(sql,
                    entity.getStatus(),
                    returnDate,
                    entity.getIssueDescription(),
                    entity.getId());
        }
        return entity;
    }

    private WarrantyClaim mapResultSet(ResultSet rs) throws SQLException {
        return WarrantyClaim
                .builder()
                .id(rs.getLong("id"))
                .productItemId(rs.getLong("product_item_id"))
                .customerId(rs.getLong("customer_id"))
                .createdBy(rs.getLong("created_by"))
                .issueDescription(rs.getString("issue_description"))
                .status(rs.getString("status"))
                .receivedDate(getInstant(rs, "received_date"))
                .returnDate(getInstant(rs, "return_date"))
                .build();
    }
}
