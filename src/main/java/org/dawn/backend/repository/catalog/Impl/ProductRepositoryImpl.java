package org.dawn.backend.repository.catalog.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.catalog.ItemStatus;
import org.dawn.backend.constant.system.ActiveStatus;
import org.dawn.backend.entity.Category;
import org.dawn.backend.entity.Product;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.repository.catalog.ProductRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.time.Instant;
import java.util.*;

@Slf4j
public class ProductRepositoryImpl extends AbstractRepository<Product, Long> implements ProductRepository {
    public ProductRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<Product> findAll() {
        String sql = """
                SELECT c.id AS cat_id, c.name AS cat_name, c.description AS cat_desc,
                p.id AS pro_id, p.sku, p.name, p.specifications, p.image_url,
                p.warranty_period, p.has_imei, p.price_import_std, p.price_export_std,
                p.current_stock, p.min_threshold, p.status AS pro_status, p.is_deleted AS pro_is_deleted,
                p.created_at, p.updated_at,
                pi.id AS item_id,
                pi.imei AS item_imei,
                pi.status AS item_status,
                pi.import_date AS item_import_date,
                pi.sold_date AS item_sold_date
                FROM products p
                JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_items pi ON p.id = pi.product_id
                ORDER BY p.created_at DESC
                """;
        Map<Long, Product> map = new LinkedHashMap<>();

        super.query(sql, rs -> {
            while (rs.next()) {
                Long id = rs.getLong("pro_id");

                Product product = map.computeIfAbsent(id, k -> {
                    try {
                        Product p = mapResultSet(rs);
                        p.setItems(new ArrayList<>());
                        return p;
                    } catch (SQLException e) {
                        throw new RuntimeException(e);
                    }
                });
//
                long itemId = rs.getLong("item_id");
                if (!rs.wasNull() && itemId > 0) {
                    ProductItem item = ProductItem
                            .builder()
                            .id(itemId)
                            .imei(rs.getString("item_imei"))
                            .status(ItemStatus.valueOf(rs.getString("item_status")))
                            .importDate(getInstant(rs, "item_import_date"))
                            .soldDate(getInstant(rs, "item_sold_date"))
                            .build();
                    product.getItems().add(item);
                }
            }
        });

        return new ArrayList<>(map.values());
    }

    @Override
    public Optional<Product> findById(Long id) {
        String sql = """
                SELECT c.id AS cat_id, c.name AS cat_name, c.description AS cat_desc,
                p.id AS pro_id, p.sku, p.name, p.specifications, p.image_url,
                p.warranty_period, p.has_imei, p.price_import_std, p.price_export_std,
                p.current_stock, p.min_threshold, p.status AS pro_status, p.is_deleted AS pro_is_deleted,
                p.created_at, p.updated_at,
                pi.id AS item_id,
                pi.imei AS item_imei,
                pi.status AS item_status,
                pi.import_date AS item_import_date,
                pi.sold_date AS item_sold_date
                FROM products p
                JOIN categories c ON p.category_id = c.id
                LEFT JOIN product_items pi ON p.id = pi.product_id
                WHERE p.id = ?
                """;

        Map<Long, Product> map = new LinkedHashMap<>();

        super.query(sql, rs -> {
            while (rs.next()) {
                Long productId = rs.getLong("pro_id");

                Product product = map.computeIfAbsent(id, k -> {
                    try {
                        Product p = mapResultSet(rs);
                        p.setItems(new ArrayList<>());
                        return p;
                    } catch (SQLException e) {
                        throw new RuntimeException(e);
                    }
                });
//
                long itemId = rs.getLong("item_id");
                if (!rs.wasNull() && itemId > 0) {
                    ProductItem item = ProductItem.builder()
                            .id(itemId)
                            .imei(rs.getString("item_imei"))
                            .status(ItemStatus.valueOf(rs.getString("item_status")))
                            .importDate(getInstant(rs, "item_import_date"))
                            .soldDate(getInstant(rs, "item_sold_date"))
                            .build();
                    product.getItems().add(item);
                }
            }
        }, id);
        return map.values().stream().findFirst();
    }

    @Override
    public Product save(Product entity) {
        Timestamp now = Timestamp.from(Instant.now());
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO products (category_id, sku, name, image_url, specifications, warranty_period, has_imei,
                    price_import_std, price_export_std, current_stock, min_threshold, status, is_deleted, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """;
            Long id = insert(
                    sql,
                    entity.getCategoryId(),
                    entity.getSku(),
                    entity.getName(),
                    entity.getImageUrl(),
                    entity.getSpecifications(),
                    entity.getWarrantyPeriod(),
                    entity.getHasImei() != null && entity.getHasImei() ? 1 : 0,
                    entity.getPriceImport(),
                    entity.getPriceExport(),
                    entity.getCurrentStock(),
                    entity.getMinThreshold(),
                    ActiveStatus.INACTIVE.name(),
                    entity.getIsDeleted() != null && entity.getIsDeleted() ? 1 : 0,
                    now,
                    now);
            entity.setStatus(ActiveStatus.INACTIVE);
            entity.setCreatedAt(now.toInstant());
            entity.setUpdatedAt(now.toInstant());
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE products
                    SET category_id = ?, sku = ?, name = ?, image_url = ?, specifications = ?, warranty_period = ?,
                    has_imei = ?, price_import_std = ?, price_export_std = ?,
                    current_stock = ?, min_threshold = ?, status = ?, is_deleted = ?, updated_at = ?
                    WHERE id = ?
                    """;
            executeQuery(sql,
                    entity.getCategoryId(),
                    entity.getSku(),
                    entity.getName(),
                    entity.getImageUrl(),
                    entity.getSpecifications(),
                    entity.getWarrantyPeriod(),
                    entity.getHasImei() != null && entity.getHasImei() ? 1 : 0,
                    entity.getPriceImport(),
                    entity.getPriceExport(),
                    entity.getCurrentStock(),
                    entity.getMinThreshold(),
                    entity.getStatus().name(),
                    entity.getIsDeleted() != null && entity.getIsDeleted() ? 1 : 0,
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
        String sql = """
                SELECT c.id AS cat_id, c.name AS cat_name, c.description AS cat_desc,
                       p.id AS pro_id, p.sku, p.name, p.specifications, p.image_url,
                       p.warranty_period, p.has_imei, p.price_import_std, p.price_export_std,
                       p.current_stock, p.min_threshold, p.status AS pro_status, p.is_deleted AS pro_is_deleted,
                       p.created_at, p.updated_at
                FROM products p
                JOIN categories c ON p.category_id = c.id
                WHERE p.sku = ?
                """;
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
        String sql = "SELECT SUM(price_import_std * current_stock) FROM products";
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
    public List<Product> findLowStockProducts() {
        String sql = """
                SELECT c.id AS cat_id, c.name AS cat_name, c.description AS cat_desc,
                       p.id AS pro_id, p.sku, p.name, p.specifications, p.image_url,
                       p.warranty_period, p.has_imei, p.price_import_std, p.price_export_std,
                       p.current_stock, p.min_threshold, p.status AS pro_status, p.is_deleted AS pro_is_deleted,
                       p.created_at, p.updated_at
                FROM products p
                JOIN categories c ON p.category_id = c.id
                WHERE p.current_stock <= p.min_threshold
                """;
        return queryList(sql, this::mapResultSet);
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

    private Product mapResultSet(ResultSet rs) throws SQLException {
        Category category = Category.builder()
                .id(rs.getLong("cat_id"))
                .name(rs.getString("cat_name"))
                .description(rs.getString("cat_desc"))
                .build();


        return Product
                .builder()
                .id(rs.getLong("pro_id"))
                .category(category)
                .categoryId(category.getId())
                .sku(rs.getString("sku"))
                .name(rs.getString("name"))
                .imageUrl(rs.getString("image_url"))
                .specifications(rs.getString("specifications"))
                .warrantyPeriod(rs.getLong("warranty_period"))
                .hasImei(rs.getBoolean("has_imei"))
                .priceImport(rs.getBigDecimal("price_import_std"))
                .priceExport(rs.getBigDecimal("price_export_std"))
                .currentStock(rs.getInt("current_stock"))
                .minThreshold(rs.getInt("min_threshold"))
                .status(ActiveStatus.valueOf(rs.getString("pro_status")))
                .isDeleted(rs.getBoolean("pro_is_deleted"))
                .createdAt(getInstant(rs, "created_at"))
                .updatedAt(getInstant(rs, "updated_at"))
                .build();
    }
}
