package org.dawn.backend.repository.Impl;

import org.dawn.backend.entity.OrderItem;
import org.dawn.backend.repository.OrderItemRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class OrderItemRepositoryImpl extends AbstractRepository<OrderItem, Long> implements OrderItemRepository {
    public OrderItemRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<OrderItem> findAll() {
        String sql = "SELECT * FROM order_items";
        return queryList(sql, this::mapResultSet);
    }

    @Override
    public Optional<OrderItem> findById(Long id) {
        String sql = "SELECT * FROM order_items WHERE id = ?";
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public List<OrderItem> findByOrderId(Long orderId) {
        String sql = "SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC";
        return queryList(sql, this::mapResultSet, orderId);
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
        ;
        return entity;
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM order_items WHERE id = ?";
        executeQuery(sql, id);
        ;
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
    }

    ;
}
