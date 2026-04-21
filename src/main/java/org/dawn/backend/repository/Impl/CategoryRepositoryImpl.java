package org.dawn.backend.repository.Impl;

import org.dawn.backend.constant.ProductStatus;
import org.dawn.backend.entity.Category;
import org.dawn.backend.entity.Product;
import org.dawn.backend.repository.CategoryRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

public class CategoryRepositoryImpl extends AbstractRepository<Category, Long> implements CategoryRepository {

    public CategoryRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<Category> findAll() {
        String sql = """
                SELECT c.id AS cat_id, c.name AS cat_name, c.description, c.created_at, c.updated_at,
                p.id AS pro_id, p.sku, p.name AS pro_name, p.price_import, p.price_export,
                p.current_stock, p.min_threshold, p.status AS pro_status,
                p.created_at, p.updated_at,
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id
                WHERE c.id = ?
                ORDER BY c.created_at DESC
                """;


        Map<Long, Category> map = new LinkedHashMap<>();

        super.query(sql, rs -> {
            while (rs.next()) {
                Long id = rs.getLong("cat_id");

                Category category = map.computeIfAbsent(id, k -> {
                    try {
                        Category c = mapResultSet(rs);
                        c.setItems(new ArrayList<>());
                        return c;
                    } catch (SQLException e) {
                        throw new RuntimeException(e);
                    }
                });

                long itemId = rs.getLong("pro_id");
                if (!rs.wasNull() && itemId > 0) {
                    Product item = Product
                            .builder()
                            .id(itemId)
                            .sku(rs.getString("sku"))
                            .name(rs.getString("pro_name"))
                            .priceImport(rs.getBigDecimal("price_import"))
                            .priceExport(rs.getBigDecimal("price_export"))
                            .currentStock(rs.getInt("current_stock"))
                            .minThreshold(rs.getInt("min_threshold"))
                            .status(ProductStatus.valueOf(rs.getString("pro_status")))
                            .createdAt(getInstant(rs, "created_at"))
                            .updatedAt(getInstant(rs, "updated_at"))
                            .build();
                    category.getItems().add(item);
                }
            }
        });
        return new ArrayList<>(map.values());
    }


    @Override
    public Optional<Category> findById(Long id) {
        String sql = """
                SELECT c.id AS cat_id, c.name AS cat_name, c.description, c.created_at, c.updated_at
                p.id AS pro_id, p.sku, p.name AS pro_name, p.price_import, p.price_export,
                p.current_stock, p.min_threshold, p.status,
                p.created_at, p.updated_at,
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id
                WHERE c.id = ?
                """;


        Map<Long, Category> map = new LinkedHashMap<>();

        super.query(sql, rs -> {
            while (rs.next()) {
                Long categoryId = rs.getLong("cat_id");

                Category category = map.computeIfAbsent(id, k -> {
                    try {
                        Category c = mapResultSet(rs);
                        c.setItems(new ArrayList<>());
                        return c;
                    } catch (SQLException e) {
                        throw new RuntimeException(e);
                    }
                });

                long itemId = rs.getLong("prod_id");
                if (!rs.wasNull() && itemId > 0) {
                    Product item = Product
                            .builder()
                            .id(itemId)
                            .sku(rs.getString("sku"))
                            .name(rs.getString("pro_name"))
                            .priceImport(rs.getBigDecimal("price_import"))
                            .priceExport(rs.getBigDecimal("price_export"))
                            .currentStock(rs.getInt("current_stock"))
                            .minThreshold(rs.getInt("min_threshold"))
                            .status(ProductStatus.valueOf(rs.getString("pro_status")))
                            .createdAt(getInstant(rs, "created_at"))
                            .updatedAt(getInstant(rs, "updated_at"))
                            .build();
                    category.getItems().add(item);
                }
            }
        }, id);

        return map.values().stream().findFirst();
    }


    @Override
    public Category save(Category entity) {
        Timestamp now = Timestamp.from(Instant.now());
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO categories (name, description, created_at, updated_at)
                    VALUES (? ,?)
                    """;
            Long id = insert(sql,
                    entity.getName(),
                    entity.getDescription(),
                    now,
                    now);
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE categories
                    SET name = ?, description = ?, updated_at = ?
                    WHERE id = ?
                    """;
            executeQuery(sql,
                    entity.getName(),
                    entity.getDescription(),
                    now,
                    entity.getId());
        }

        return entity;
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM categories WHERE id = ?";
        executeQuery(sql, id);
    }


    private Category mapResultSet(ResultSet rs) throws SQLException {
        return Category
                .builder()
                .id(rs.getLong("id"))
                .name(rs.getString("cat_name"))
                .description(rs.getString("description"))
                .createdAt(getInstant(rs, "created_at"))
                .updatedAt(getInstant(rs, "updated_at"))
                .build();
    }
}
