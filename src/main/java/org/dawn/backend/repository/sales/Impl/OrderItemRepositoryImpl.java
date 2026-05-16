package org.dawn.backend.repository.sales.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.entity.OrderItem;
import org.dawn.backend.entity.Product;
import org.dawn.backend.repository.sales.OrderItemRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Slf4j
public class OrderItemRepositoryImpl extends AbstractRepository<OrderItem, Long> implements OrderItemRepository {
    public OrderItemRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<OrderItem> findAll() {
        String sql = """
                SELECT oi.*, p.name AS product_name, p.sku AS product_sku
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id ASC
                """;
        return queryList(sql, this::mapResultSet);
    }

    @Override
    public Optional<OrderItem> findById(Long id) {
        String sql = "SELECT * FROM order_items WHERE id = ?";
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public List<OrderItem> findByOrderId(Long orderId) {
        String sql = """
                SELECT oi.*, p.name AS product_name, p.sku AS product_sku
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id ASC
                """;
        return queryList(sql, this::mapResultSetWithProduct, orderId);
    }

    private OrderItem mapResultSetWithProduct(ResultSet rs) throws SQLException {
        Product product = Product.builder()
                .id(rs.getLong("product_id"))
                .name(rs.getString("product_name"))
                .sku(rs.getString("product_sku"))
                .build();
        return OrderItem.builder()
                .id(rs.getLong("id"))
                .orderId(rs.getLong("order_id"))
                .productId(rs.getLong("product_id"))
                .quantity(rs.getInt("quantity"))
                .unitPrice(rs.getBigDecimal("unit_price"))
                .product(product)
                .build();
    }

    @Override
    public long getTotalQuantityByOrderId(Long orderId) {
        String sql = "SELECT SUM(quantity) FROM order_items WHERE order_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, orderId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getLong(1);
            }
        } catch (SQLException e) {
            log.error("Error getTotalQuantityByOrderId for order: {}", orderId, e);
        }
        return 0L;
    }

    @Override
    public OrderItem save(OrderItem entity) {
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO order_items
                    (order_id, product_id, quantity, unit_price)
                    VALUES (?, ?, ?, ?)
                    """;
            Long id = insert(sql,
                    entity.getOrderId(),
                    entity.getProductId(),
                    entity.getQuantity(),
                    entity.getUnitPrice());
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE order_items
                    SET order_id = ?, product_id = ?, quantity = ?, unit_price = ?
                    WHERE id = ?
                    """;
            executeQuery(sql,
                    entity.getOrderId(),
                    entity.getProductId(),
                    entity.getQuantity(),
                    entity.getUnitPrice(),
                    entity.getId());
        }
        return entity;
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM order_items WHERE id = ?";
        executeQuery(sql, id);
    }

    private OrderItem mapResultSet(ResultSet rs) throws SQLException {
        return OrderItem
                .builder()
                .id(rs.getLong("id"))
                .orderId(rs.getLong("order_id"))
                .productId(rs.getLong("product_id"))
                .quantity(rs.getInt("quantity"))
                .unitPrice(rs.getBigDecimal("unit_price"))
                .build();
    };
}
