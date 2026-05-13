package org.dawn.backend.repository.catalog.Impl;

import org.dawn.backend.constant.system.ActiveStatus;
import org.dawn.backend.entity.Category;
import org.dawn.backend.entity.Product;
import org.dawn.backend.repository.catalog.CategoryRepository;
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
                SELECT c.id AS cat_id, c.name AS cat_name, c.description, c.is_deleted AS cat_is_deleted,
                c.created_at AS cat_created_at, c.updated_at AS cat_updated_at,
                p.id AS pro_id, p.sku, p.name AS pro_name, p.price_import_std, p.price_export_std, p.image_url,
                p.current_stock, p.min_threshold, p.status AS pro_status, p.specifications AS pro_spec,
                p.created_at AS pro_created_at, p.updated_at AS pro_updated_at
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id
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
                            .categoryId(id)
                            .sku(rs.getString("sku"))
                            .name(rs.getString("pro_name"))
                            .imageUrl(rs.getString("image_url"))
                            .specifications(rs.getString("pro_spec"))
                            .priceImport(rs.getBigDecimal("price_import_std"))
                            .priceExport(rs.getBigDecimal("price_export_std"))
                            .currentStock(rs.getInt("current_stock"))
                            .minThreshold(rs.getInt("min_threshold"))
                            .status(ActiveStatus.valueOf(rs.getString("pro_status")))
                            .createdAt(getInstant(rs, "pro_created_at"))
                            .updatedAt(getInstant(rs, "pro_updated_at"))
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
                SELECT c.id AS cat_id, c.name AS cat_name, c.description, c.is_deleted AS cat_is_deleted,
                c.created_at AS cat_created_at, c.updated_at AS cat_updated_at,
                p.id AS pro_id, p.sku, p.name AS pro_name, p.price_import_std, p.price_export_std, p.image_url,
                p.current_stock, p.min_threshold, p.status AS pro_status, p.specifications AS pro_spec,
                p.created_at AS pro_created_at, p.updated_at AS pro_updated_at
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

                long itemId = rs.getLong("pro_id");
                if (!rs.wasNull() && itemId > 0) {
                    Product item = Product
                            .builder()
                            .id(itemId)
                            .categoryId(id)
                            .sku(rs.getString("sku"))
                            .name(rs.getString("pro_name"))
                            .imageUrl(rs.getString("image_url"))
                            .specifications(rs.getString("pro_spec"))
                            .priceImport(rs.getBigDecimal("price_import_std"))
                            .priceExport(rs.getBigDecimal("price_export_std"))
                            .currentStock(rs.getInt("current_stock"))
                            .minThreshold(rs.getInt("min_threshold"))
                            .status(ActiveStatus.valueOf(rs.getString("pro_status")))
                            .createdAt(getInstant(rs, "pro_created_at"))
                            .updatedAt(getInstant(rs, "pro_updated_at"))
                            .build();
                    category.getItems().add(item);
                }
            }
        }, id);

        return map.values().stream().findFirst();
    }


    @Override
    public Optional<Category> findByName(String name) {
        String sql = """
                SELECT c.id AS cat_id, c.name AS cat_name, c.description, c.is_deleted AS cat_is_deleted,
                c.created_at AS cat_created_at, c.updated_at AS cat_updated_at,
                p.id AS pro_id, p.sku, p.name AS pro_name, p.price_import_std, p.price_export_std, p.image_url,
                p.current_stock, p.min_threshold, p.status AS pro_status, p.specifications AS pro_spec,
                p.created_at AS pro_created_at, p.updated_at AS pro_updated_at
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id
                WHERE c.name = ?
                """;


        Map<String, Category> map = new LinkedHashMap<>();

        super.query(sql, rs -> {
            while (rs.next()) {
                Long id = rs.getLong("cat_id");

                Category category = map.computeIfAbsent(name, k -> {
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
                            .categoryId(id)
                            .sku(rs.getString("sku"))
                            .name(rs.getString("pro_name"))
                            .imageUrl(rs.getString("image_url"))
                            .specifications(rs.getString("pro_spec"))
                            .priceImport(rs.getBigDecimal("price_import_std"))
                            .priceExport(rs.getBigDecimal("price_export_std"))
                            .currentStock(rs.getInt("current_stock"))
                            .minThreshold(rs.getInt("min_threshold"))
                            .status(ActiveStatus.valueOf(rs.getString("pro_status")))
                            .createdAt(getInstant(rs, "created_at"))
                            .updatedAt(getInstant(rs, "updated_at"))
                            .build();
                    category.getItems().add(item);
                }
            }
        }, name);

        return map.values().stream().findFirst();
    }

    @Override
    public Category save(Category entity) {
        Timestamp now = Timestamp.from(Instant.now());
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO categories (name, description, is_deleted ,created_at, updated_at)
                    VALUES (? ,?, ?, ?, ?)
                    """;
            Long id = insert(sql,
                    entity.getName(),
                    entity.getDescription(),
                    entity.getIsDeleted(),
                    now,
                    now);
            entity.setCreatedAt(now.toInstant());
            entity.setUpdatedAt(now.toInstant());
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE categories
                    SET name = ?, description = ?, is_deleted = ? ,updated_at = ?
                    WHERE id = ?
                    """;
            executeQuery(sql,
                    entity.getName(),
                    entity.getDescription(),
                    entity.getIsDeleted(),
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
                .id(rs.getLong("cat_id"))
                .name(rs.getString("cat_name"))
                .description(rs.getString("description"))
                .isDeleted(rs.getBoolean("cat_is_deleted"))
                .createdAt(getInstant(rs, "cat_created_at"))
                .updatedAt(getInstant(rs, "cat_updated_at"))
                .build();
    }

}
