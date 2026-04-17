package org.dawn.backend.repository.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.ItemStatus;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.Instant;
import java.util.List;
import java.util.Optional;


@Slf4j
public class ProductItemRepositoryImpl extends AbstractRepository<ProductItem, Long> implements org.dawn.backend.repository.ProductItemRepository {


    public ProductItemRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<ProductItem> findAll() {
        String sql = """
                SELECT * FROM product_items ORDER BY import_date DESC
                """;
        return queryList(sql, this::mapResultSet);
    }

    @Override
    public Optional<ProductItem> findById(Long id) {
        String sql = "SELECT * FROM product_items WHERE id = ?";
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public ProductItem save(ProductItem entity) {
        Timestamp now = Timestamp.from(Instant.now());
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO product_items
                    (product_id, imei, status, order_id, import_date, sold_date)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """;

            Long id = insert(sql,
                    entity.getProductId(),
                    entity.getImei(),
                    entity.getStatus(),
                    entity.getOrderId(),
                    entity.getImportDate() != null ? Timestamp.from(entity.getImportDate()) : now,
                    entity.getSoldDate() != null ? Timestamp.from(entity.getSoldDate()) : now
            );
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE product_items
                    SET product_id = ?, imei = ?, status = ?, order_id = ?, import_date = ?, sold_date = ?\s
                    WHERE id = ?
                    """;

            executeQuery(sql,
                    entity.getProductId(),
                    entity.getImei(),
                    entity.getStatus(),
                    entity.getOrderId(),
                    entity.getImportDate() != null ? Timestamp.from(entity.getImportDate()) : now,
                    entity.getSoldDate() != null ? Timestamp.from(entity.getSoldDate()) : now,
                    entity.getId());

        }

        return entity;
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM product_items WHERE id = ?";
        executeQuery(sql, id);
    }

    @Override
    public Optional<ProductItem> findByImei(String imei) {
        String sql = "SELECT * FROM product_items WHERE imei = ?";
        return queryOne(sql, this::mapResultSet, imei);
    }

    @Override
    public List<ProductItem> findByOrderId(Long orderId) {
        String sql = "SELECT * FROM product_items WHERE order_id = ? ORDER BY id ASC";
        return queryList(sql, this::mapResultSet, orderId);
    }

    @Override
    public long countByOrderId(Long orderId) {
        String sql = "SELECT COUNT(*) FROM product_items WHERE order_id = ?";
        return count(sql, orderId);
    }

    @Override
    public boolean existsByImei(String imei) {
        String sql = """
                SELECT COUNT(*) FROM product_items WHERE imei = ?
                """;
        return checkExists(sql, imei);
    }

    @Override
    public List<ProductItem> findByProductIdAndStatus(Long productId, String status) {
        String sql = "SELECT * FROM product_items WHERE product_id = ? AND status = ?";
        return queryList(sql, this::mapResultSet, productId, status);
    }

    private boolean checkExists(String sql, Object param) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setObject(1, param);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getLong(1) > 0;
            }
        } catch (SQLException e) {
            log.error("Exists check error", e);
        }
        return false;
    }

    private ProductItem mapResultSet(ResultSet rs) throws SQLException {
        return ProductItem.builder()
                .id(rs.getLong("id"))
                .productId(rs.getLong("product_id"))
                .imei(rs.getString("imei"))
                .status(ItemStatus.valueOf(rs.getString("status")))
                .orderId(rs.getLong("order_id"))
                .importDate(getInstant(rs, "import_date"))
                .soldDate(getInstant(rs, "sold_date"))
                .build();
    }

    private Instant getInstant(ResultSet rs, String col) throws SQLException {
        Timestamp ts = rs.getTimestamp(col);
        return ts != null ? ts.toInstant() : null;
    }
}
