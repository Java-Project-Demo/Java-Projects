package org.dawn.backend.repository.Impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.ProductStatus;
import org.dawn.backend.entity.Product;
import org.dawn.backend.repository.ProductRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Slf4j
public class ProductRepositoryImpl extends AbstractRepository<Product, Long> implements ProductRepository {
    public ProductRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<Product> findAll() {
        String sql = """
                SELECT p.*
                FROM products p
                ORDER BY p.created_at DESC
                """;
        return queryList(sql, this::mapResultSet);
    }

    @Override
    public Optional<Product> findById(Long id) {
        String sql = "SELECT * FROM products WHERE id = ?";
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public Product save(Product entity) {
        Timestamp now = Timestamp.from(Instant.now());
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO products (sku, name, price_import, price_export, current_stock, min_threshold, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """;
            Long id = insert(
                    sql,
                    entity.getSku(),
                    entity.getName(),
                    entity.getPriceImport(),
                    entity.getPriceExport(),
                    entity.getCurrentStock(),
                    entity.getMinThreshold(),
                    ProductStatus.INACTIVE.name(),
                    now,
                    now);
            entity.setCreatedAt(now.toInstant());
            entity.setUpdatedAt(now.toInstant());
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE products
                    SET sku = ?, name = ?, price_import = ?, price_export = ?, current_stock = ?, min_threshold = ?, status = ?, updated_at = ?
                    WHERE id = ?
                    """;
            executeQuery(sql,
                    entity.getSku(),
                    entity.getName(),
                    entity.getPriceImport(),
                    entity.getPriceExport(),
                    entity.getCurrentStock(),
                    entity.getMinThreshold(),
                    entity.getStatus().name(),
                    now,
                    entity.getId());
        }

        return entity;
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM products WHERE id = ?";
        executeQuery(sql, id);
    }

    @Override
    public Optional<Product> findBySku(String sku) {
        String sql = "SELECT * FROM products WHERE sku = ?";
        return queryOne(sql, this::mapResultSet, sku);
    }

    @Override
    public Long countLowStock() {
        String sql = "SELECT COUNT(*) FROM products WHERE current_stock <= min_threshold";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getLong(1);
        } catch (SQLException e) {
            log.error("Error count low stock", e);
        }
        return 0L;
    }

    @Override
    public BigDecimal getTotalInventoryValue() {
        String sql = "SELECT SUM(price_import * current_stock) FROM products";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                BigDecimal value = rs.getBigDecimal(1);
                return value != null ? value : BigDecimal.ZERO;
            }
        } catch (SQLException e) {
            log.error("Error get total inventory value", e);
        }
        return BigDecimal.ZERO;
    }

    @Override
    public void addStock(Long id, Integer qty) {
        String sql = "UPDATE products SET current_stock = current_stock + ? WHERE id = ?";
        executeQuery(sql, qty, id);
    }

    @Override
    public int subtractStock(Long id, Integer qty) {
        String sql = """
                UPDATE products
                SET current_stock = current_stock - ?
                WHERE id = ? AND current_stock >= ?
                """;
        return executeQuery(sql, qty, id, qty);
    }


    @Override
    public Long count() {
        String sql = "SELECT COUNT(*) FROM products";
        return count(sql);
    }

    public Product mapResultSet(ResultSet rs) throws SQLException {
        return Product
                .builder()
                .id(rs.getLong("id"))
                .sku(rs.getString("sku"))
                .name(rs.getString("name"))
                .priceImport(rs.getBigDecimal("price_import"))
                .priceExport(rs.getBigDecimal("price_export"))
                .currentStock(rs.getInt("current_stock"))
                .minThreshold(rs.getInt("min_threshold"))
                .status(ProductStatus.valueOf(rs.getString("status")))
                .createdAt(getInstant(rs, "created_at"))
                .updatedAt(getInstant(rs, "updated_at"))
                .build();
    }

    private Instant getInstant(ResultSet rs, String col) throws SQLException {
        Timestamp ts = rs.getTimestamp(col);
        return ts != null ? ts.toInstant() : null;
    }
}
