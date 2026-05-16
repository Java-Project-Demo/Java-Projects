package org.dawn.backend.repository.catalog.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.catalog.ItemStatus;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.repository.base.AbstractRepository;
import org.dawn.backend.repository.catalog.ProductItemRepository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Slf4j
public class ProductItemRepositoryImpl extends AbstractRepository<ProductItem, Long> implements ProductItemRepository {


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
    public List<String> findMissingImeis(Long sessionId) {
        String sql = """
                SELECT imei FROM product_items
                WHERE status = 'AVAILABLE'
                AND imei NOT IN (
                     SELECT imei FROM inventory_details WHERE session_id = ?
                )
                """;
        List<String> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setObject(1, sessionId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(rs.getString("imei"));
                }
            }
        } catch (SQLException e) {
            log.error("Error find missing imeis for session {}", sessionId, e);
        }
        return list;
    }

    @Override
    public List<String> findMissingImeisByWarehouse(Long sessionId, Long warehouseId) {
        String sql = """
                SELECT pi.imei
                FROM product_items pi
                JOIN warehouse_locations wl ON pi.location_id = wl.id
                WHERE pi.status = 'AVAILABLE'
                  AND wl.warehouse_id = ?
                  AND pi.imei NOT IN (
                      SELECT imei FROM inventory_details WHERE session_id = ?
                  )
                """;
        List<String> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setObject(1, warehouseId);
            ps.setObject(2, sessionId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(rs.getString("imei"));
                }
            }
        } catch (SQLException e) {
            log.error("Error find missing imeis for session {} / warehouse {}", sessionId, warehouseId, e);
        }
        return list;
    }

    @Override
    public List<ProductItem> findAgingStock(int days) {
        String sql = """
                SELECT *
                FROM product_items
                WHERE status = 'AVAILABLE'
                AND import_date < (CURRENT_TIMESTAMP - NUMTODSINTERVAL(? , 'DAY'))
                ORDER BY import_date ASC
                """;
        return queryList(sql, this::mapResultSet, (double) days);
    }

    @Override
    public ProductItem save(ProductItem entity) {
        Timestamp now = Timestamp.from(Instant.now());
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO product_items
                    (product_id, location_id, imei, cost_price, supplier_id, condition, status, order_id, warranty_expiry_date, import_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """;

            Long id = insert(sql,
                    entity.getProductId(),
                    entity.getLocationId(),
                    entity.getImei(),
                    entity.getCostPrice(),
                    entity.getSupplierId(),
                    entity.getCondition(),
                    ItemStatus.AVAILABLE.name(),
                    null,
                    entity.getWarrantyExpiryDate(),
                    now
            );
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE product_items
                    SET location_id = ?, cost_price = ?, supplier_id = ?, condition = ?,status = ?, order_id = ?, warranty_expiry_date = ?, sold_date = ?
                    WHERE id = ?
                    """;

            executeQuery(sql,
                    entity.getLocationId(),
                    entity.getCostPrice(),
                    entity.getSupplierId(),
                    entity.getCondition(),
                    entity.getStatus().name(),
                    entity.getOrderId(),
                    entity.getWarrantyExpiryDate() != null ? Timestamp.from(entity.getWarrantyExpiryDate()) : null,
                    entity.getSoldDate() != null ? Timestamp.from(entity.getSoldDate()) : null,
                    entity.getId());

        }

        return entity;
    }


    @Override
    public void saveAll(List<ProductItem> entities) {
        String sql = """
                INSERT INTO product_items
                (product_id, location_id, imei, cost_price, supplier_id, condition, status, order_id, warranty_expiry_date, import_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        Timestamp now = Timestamp.from(Instant.now());
        List<Object[]> paramsList = entities.stream().map(entity -> new Object[]{
                entity.getProductId(),
                entity.getLocationId(),
                entity.getImei(),
                entity.getCostPrice(),
                entity.getSupplierId(),
                entity.getCondition(),
                entity.getStatus() != null ? entity.getStatus().name() : ItemStatus.AVAILABLE.name(),
                entity.getOrderId() != null ? entity.getOrderId() : null,
                entity.getWarrantyExpiryDate() != null ? Timestamp.from(entity.getWarrantyExpiryDate()) : null,
                now
        }).toList();
        executeBatch(sql, paramsList);
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
    public long countByProductIdAndOrderId(Long productId, Long orderId) {
        String sql = "SELECT COUNT(*) FROM product_items WHERE product_id = ? AND order_id = ?";
        return count(sql, productId, orderId);
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
        String sql = """
                SELECT * FROM product_items
                WHERE product_id = ? AND status = ?
                ORDER BY import_date ASC NULLS LAST, id ASC
                """;
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
        Long orderId = rs.getObject("order_id") != null ? rs.getLong("order_id") : null;
        Long locationId = rs.getObject("location_id") != null ? rs.getLong("location_id") : null;
        Long supplierId = rs.getObject("supplier_id") != null ? rs.getLong("supplier_id") : null;
        return ProductItem.builder()
                .id(rs.getLong("id"))
                .productId(rs.getLong("product_id"))
                .imei(rs.getString("imei"))
                .costPrice(rs.getBigDecimal("cost_price"))
                .supplierId(supplierId)
                .locationId(locationId)
                .condition(rs.getString("condition"))
                .status(ItemStatus.valueOf(rs.getString("status")))
                .orderId(orderId)
                .warrantyExpiryDate(getInstant(rs, "warranty_expiry_date"))
                .importDate(getInstant(rs, "import_date"))
                .soldDate(getInstant(rs, "sold_date"))
                .build();
    }

}
