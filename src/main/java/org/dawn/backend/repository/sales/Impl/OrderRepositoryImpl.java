package org.dawn.backend.repository.sales.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.sales.OrderStatus;
import org.dawn.backend.constant.sales.PaymentMethod;
import org.dawn.backend.entity.Customer;
import org.dawn.backend.entity.Order;
import org.dawn.backend.entity.User;
import org.dawn.backend.repository.sales.OrderRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
public class OrderRepositoryImpl extends AbstractRepository<Order, Long> implements OrderRepository {

    public OrderRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }


    @Override
    public List<Order> search(String status, LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        StringBuilder sql = new StringBuilder("""
                SELECT o.*,
                u.full_name AS staff_name,
                c.full_name AS customer_name,
                c.phone_number AS customer_phone
                FROM orders o
                JOIN users u ON o.sale_id = u.id
                JOIN customers c ON o.customer_id = c.id
                WHERE 1=1
                """);
        List<Object> params = new ArrayList<>();

        if (status != null && !status.isBlank()) {
            sql.append(" AND o.status = ?");
            params.add(status);
        }

        if (startDate != null) {
            sql.append(" AND o.created_at >= ?");
            params.add(Timestamp.valueOf(startDate));
        }

        if (endDate != null) {
            sql.append(" AND o.created_at <= ?");
            params.add(Timestamp.valueOf(endDate));
        }

        sql.append("""
                ORDER BY o.created_at DESC
                OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
                """);
        params.add(page * size);
        params.add(size);
        return queryList(sql.toString(), this::mapResultSet, params.toArray());
    }

    @Override
    public long countSearch(String status, LocalDateTime startDate, LocalDateTime endDate) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM orders o WHERE 1=1");
        List<Object> params = new ArrayList<>();
        if (status != null && !status.isBlank()) {
            sql.append(" AND o.status = ?");
            params.add(status);
        }
        if (startDate != null) {
            sql.append(" AND o.created_at >= ?");
            params.add(Timestamp.valueOf(startDate));
        }
        if (endDate != null) {
            sql.append(" AND o.created_at <= ?");
            params.add(Timestamp.valueOf(endDate));
        }
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) ps.setObject(i + 1, params.get(i));
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getLong(1);
            }
        } catch (SQLException e) {
            log.error("Error countSearch orders", e);
        }
        return 0L;
    }

    @Override
    public List<Order> findAll() {
        String sql = """
                SELECT o.*,
                u.full_name AS staff_name,
                c.full_name AS customer_name,
                c.phone_number AS customer_phone
                FROM orders o
                JOIN users u ON o.sale_id = u.id
                JOIN customers c ON o.customer_id = c.id
                ORDER BY o.created_at DESC
                """;
        return queryList(sql, this::mapResultSet);
    }

    @Override
    public Optional<Order> findById(Long id) {
        String sql = """
                SELECT o.*,
                u.full_name AS staff_name,
                c.full_name AS customer_name,
                c.phone_number AS customer_phone
                FROM orders o
                JOIN users u ON o.sale_id = u.id
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
        String sql = """
                SELECT o.*,
                u.full_name AS staff_name,
                c.full_name AS customer_name,
                c.phone_number AS customer_phone
                FROM orders o
                JOIN users u ON o.sale_id = u.id
                JOIN customers c ON o.customer_id = c.id
                WHERE o.status = ?
                ORDER BY o.created_at DESC
                """;
        return queryList(sql, this::mapResultSet, status.toString());
    }

    @Override
    public List<Order> findByStatusOrderByCreatedAtAsc(OrderStatus status) {
        String sql = """
                SELECT o.*,
                u.full_name AS staff_name,
                c.full_name AS customer_name,
                c.phone_number AS customer_phone
                FROM orders o
                JOIN users u ON o.sale_id = u.id
                JOIN customers c ON o.customer_id = c.id
                WHERE o.status = ?
                ORDER BY o.created_at ASC
                """;
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
        Customer customer = Customer
                .builder()
                .fullName(rs.getString("customer_name"))
                .phoneNumber(rs.getString("customer_phone"))
                .build();

        User seller = User.builder()
                .fullName(rs.getString("staff_name"))
                .build();

        return Order
                .builder()
                .id(rs.getLong("id"))
                .saleId(rs.getLong("sale_id"))
                .customerId(rs.getLong("customer_id"))
                .totalAmount(rs.getBigDecimal("total_amount"))
                .paymentMethod(PaymentMethod.valueOf(rs.getString("payment_method")))
                .status(OrderStatus.valueOf(rs.getString("status")))
                .customer(customer)
                .seller(seller)
                .createdAt(getInstant(rs, "created_at"))
                .updatedAt(getInstant(rs, "updated_at"))
                .build();
    }
}
