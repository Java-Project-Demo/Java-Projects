package org.dawn.backend.repository.warranty.Impl;

import org.dawn.backend.constant.warranty.WarrantyStatus;
import org.dawn.backend.entity.*;
import org.dawn.backend.repository.warranty.WarrantyRepository;
import org.dawn.backend.repository.base.AbstractRepository;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class WarrantyRepositoryImpl extends AbstractRepository<Warranty, Long> implements WarrantyRepository {
    public WarrantyRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<Warranty> findAll() {
        String sql = """
                SELECT w.*,
                pi.imei AS pi_imei,
                p.name AS pro_name,
                c.full_name AS cus_name,
                c.phone_number AS cus_phone,
                u.full_name AS staff_name,
                u.username AS staff_username
                FROM warranty_claims w
                LEFT JOIN product_items pi ON w.product_item_id = pi.id
                LEFT JOIN products p ON pi.product_id = p.id
                LEFT JOIN customers c ON w.customer_id = c.id
                LEFT JOIN users u ON w.created_by = u.id
                ORDER BY w.received_date DESC
                """;
        return queryList(sql, this::mapResultSet);
    }


    @Override
    public Optional<Warranty> findById(Long id) {
        String sql = """
                SELECT w.*,
                pi.imei AS pi_imei,
                p.name AS pro_name,
                c.full_name AS cus_name,
                c.phone_number AS cus_phone,
                u.full_name AS staff_name,
                u.username AS staff_username
                FROM warranty_claims w
                LEFT JOIN product_items pi ON w.product_item_id = pi.id
                LEFT JOIN products p ON pi.product_id = p.id
                LEFT JOIN customers c ON w.customer_id = c.id
                LEFT JOIN users u ON w.created_by = u.id
                WHERE w.id = ?
                """;
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public List<Warranty> findByProductItemId(Long itemId) {
        String sql = """
                SELECT w.*,
                pi.imei AS pi_imei,
                p.name AS pro_name,
                c.full_name AS cus_name,
                c.phone_number AS cus_phone,
                u.full_name AS staff_name,
                u.username AS staff_username
                FROM warranty_claims w
                LEFT JOIN product_items pi ON w.product_item_id = pi.id
                LEFT JOIN products p ON pi.product_id = p.id
                LEFT JOIN customers c ON w.customer_id = c.id
                LEFT JOIN users u ON w.created_by = u.id
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
            entity.setStatus(WarrantyStatus.RECEIVED);
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
        Product product = Product.builder()
                .name(rs.getString("pro_name"))
                .build();

        ProductItem pi = ProductItem.builder()
                .id(rs.getLong("product_item_id"))
                .imei(rs.getString("pi_imei"))
                .product(product)
                .build();

        Customer customer = Customer.builder()
                .id(rs.getLong("customer_id"))
                .fullName(rs.getString("cus_name"))
                .phoneNumber(rs.getString("cus_phone"))
                .build();

        User staff = User.builder()
                .id(rs.getLong("created_by"))
                .fullName(rs.getString("staff_name"))
                .username(rs.getString("staff_username"))
                .build();

        return Warranty.builder()
                .id(rs.getLong("id"))
                .productItemId(rs.getLong("product_item_id"))
                .customerId(rs.getLong("customer_id"))
                .createdBy(rs.getLong("created_by"))
                .issueDescription(rs.getString("issue_description"))
                .status(WarrantyStatus.valueOf(rs.getString("status")))
                .receivedDate(getInstant(rs, "received_date"))
                .returnDate(getInstant(rs, "return_date"))
                .productItem(pi)
                .customer(customer)
                .staff(staff)
                .build();
    }
}
