package org.dawn.backend.repository.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.OrderStatus;
import org.dawn.backend.constant.PaymentMethod;
import org.dawn.backend.entity.Order;
import org.dawn.backend.repository.OrderRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Slf4j
public class OrderRepositoryImpl extends AbstractRepository<Order, Long> implements OrderRepository {

    public OrderRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }


    @Override
    public List<Order> findAll() {
        String sql = """
                SELECT o.*, c.full_name AS cus_name, c.phone_number AS cus_phone
                FROM orders o
                JOIN customers c ON o.customer_id = c.id
                ORDER BY o.created_at DESC
                """;
        return queryList(sql, this::mapResultSet);
    }

    @Override
    public Optional<Order> findById(Long id) {
        String sql = """
                SELECT o.*, c.full_name AS cus_name, c.phone_number AS cus_phone
                FROM orders o
                JOIN customers c ON o.customer_id = c.id
                WHERE o.id = ?
                """;
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public Order save(Order entity) {
        Timestamp now = Timestamp.from(Instant.now());
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO orders
                    (sale_id, customer_id, total_amount, payment_method, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """;
            Long id = insert(sql,
                    entity.getSaleId(),
                    entity.getCustomerId(),
                    entity.getTotalAmount(),
                    entity.getPaymentMethod().name(),
                    OrderStatus.PENDING.name(),
                    now,
                    now);
            entity.setCreatedAt(now.toInstant());
            entity.setUpdatedAt(now.toInstant());
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE orders
                    SET sale_id = ?, customer_id = ?, total_amount = ?, payment_method = ?, status = ?, updated_at = ?
                    WHERE id = ?
                    """;
            executeQuery(sql,
                    entity.getSaleId(),
                    entity.getCustomerId(),
                    entity.getTotalAmount(),
                    entity.getPaymentMethod().name(),
                    entity.getStatus().name(),
                    now,
                    entity.getId());
        }
        return entity;
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM orders WHERE id = ?";
        executeQuery(sql, id);
    }

    @Override
    public List<Order> findByStatus(OrderStatus status) {
        String sql = "SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC";
        return queryList(sql, this::mapResultSet, status.toString());
    }

    @Override
    public List<Order> findByStatusOrderByCreatedAtAsc(OrderStatus status) {
        String sql = "SELECT * FROM orders WHERE status = ? ORDER BY created_at ASC";
        return queryList(sql, this::mapResultSet, status.toString());
    }

    @Override
    public Long countByStatus(OrderStatus status) {
        String sql = "SELECT COUNT(*) FROM orders WHERE status = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getLong(1);
            }
        } catch (SQLException e) {
            log.error("Error countByStatus", e);
        }
        return 0L;
    }

    @Override
    public Integer getAvailableStock(Long productId) {
        String sql = """
                SELECT p.current_stock -
                    COALESCE((SELECT SUM(oi.quantity)
                        FROM order_items oi
                        JOIN orders o ON oi.order_id = o.id
                        WHERE oi.product_id = p.id
                        AND o.status = 'PENDING'), 0) as available_stock
                FROM products p
                WHERE p.id = ?
                """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, productId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt("available_stock");
            }
        } catch (SQLException e) {
            log.error("Error getAvailableStock for product: {}", productId, e);
        }
        return 0;
    }

    @Override
    public BigDecimal getTodayRevenue() {
        String sql = """
                SELECT SUM(total_amount)
                FROM orders
                WHERE status = 'COMPLETE' AND TRUNC(created_at) = TRUNC(SYSDATE)
                """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                BigDecimal value = rs.getBigDecimal(1);
                return value != null ? value : BigDecimal.ZERO;
            }
        } catch (SQLException e) {
            log.error("Error get total revenue", e);
        }
        return BigDecimal.ZERO;
    }

    @Override
    public BigDecimal getTodayGrossProfit() {
        String sql = """
                SELECT SUM(oi.unit_price * oi.quantity) - SUM(pi.cost_price)
                FROM order_items oi
                JOIN product_items pi ON oi.order_id = pi.order_id
                AND oi.product_id = pi.product_id
                JOIN orders o ON o.id = oi.order_id
                WHERE o.status = 'COMPLETED' AND TRUNC(o.created_at) = TRUNC(SYSDATE)
                """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                BigDecimal value = rs.getBigDecimal(1);
                return value != null ? value : BigDecimal.ZERO;
            }
        } catch (SQLException e) {
            log.error("Error get total gross profit", e);
        }
        return BigDecimal.ZERO;
    }

    private Order mapResultSet(ResultSet rs) throws SQLException {
        return Order
                .builder()
                .id(rs.getLong("id"))
                .saleId(rs.getLong("sale_id"))
                .customerId(rs.getLong("customer_id"))
                .totalAmount(rs.getBigDecimal("total_amount"))
                .paymentMethod(PaymentMethod.valueOf(rs.getString("payment_method")))
                .status(OrderStatus.valueOf(rs.getString("status")))
                .createdAt(getInstant(rs, "created_at"))
                .updatedAt(getInstant(rs, "updated_at"))
                .build();
    }
}
