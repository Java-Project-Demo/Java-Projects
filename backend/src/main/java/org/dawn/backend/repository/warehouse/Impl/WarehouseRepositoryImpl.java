package org.dawn.backend.repository.warehouse.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.catalog.ItemStatus;
import org.dawn.backend.entity.Product;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.entity.Warehouse;
import org.dawn.backend.entity.WarehouseLocation;
import org.dawn.backend.repository.base.AbstractRepository;
import org.dawn.backend.repository.warehouse.WarehouseRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Slf4j
public class WarehouseRepositoryImpl extends AbstractRepository<Warehouse, Long> implements WarehouseRepository {
    public WarehouseRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<Warehouse> findAll() {
        String sql = """
                SELECT w.id AS w_id, w.name AS w_name, w.address AS w_address,
                w.created_at, w.updated_at,
                l.id AS loc_id, l.zone_name, l.row_num, l.shelf_num, l.bin_num, l.capacity,
                pi.id AS pi_id, pi.product_id AS pi_product_id, pi.imei AS pi_imei, pi.status AS pi_status,
                p.name AS p_name, p.sku AS p_sku
                FROM warehouses w
                LEFT JOIN warehouse_locations l ON w.id = l.warehouse_id
                LEFT JOIN product_items pi ON pi.location_id = l.id AND pi.status = 'AVAILABLE'
                LEFT JOIN products p ON pi.product_id = p.id
                ORDER BY w.id ASC, l.id ASC
                """;
        Map<Long, Warehouse> warehouseMap = new LinkedHashMap<>();
        Map<Long, WarehouseLocation> locationMap = new HashMap<>();
        super.query(sql, rs -> {
            while (rs.next()) {
                Long warehouseId = rs.getLong("w_id");
                Warehouse warehouse = warehouseMap.computeIfAbsent(warehouseId, k -> {
                    try {
                        Warehouse w = mapResultSet(rs);
                        w.setLocations(new ArrayList<>());
                        return w;
                    } catch (SQLException e) {
                        throw new RuntimeException(e);
                    }
                });

                long locId = rs.getLong("loc_id");
                if (rs.wasNull() || locId <= 0) continue;

                WarehouseLocation location = locationMap.get(locId);
                if (location == null) {
                    location = WarehouseLocation
                            .builder()
                            .id(locId)
                            .warehouseId(warehouseId)
                            .zoneName(rs.getString("zone_name"))
                            .rowNum(rs.getString("row_num"))
                            .shelfNum(rs.getString("shelf_num"))
                            .binNum(rs.getString("bin_num"))
                            .capacity(rs.getLong("capacity"))
                            .items(new ArrayList<>())
                            .build();
                    locationMap.put(locId, location);
                    warehouse.getLocations().add(location);
                }

                long piId = rs.getLong("pi_id");
                if (!rs.wasNull() && piId > 0) {
                    Product product = Product.builder()
                            .id(rs.getLong("pi_product_id"))
                            .name(rs.getString("p_name"))
                            .sku(rs.getString("p_sku"))
                            .build();
                    ProductItem item = ProductItem.builder()
                            .id(piId)
                            .productId(rs.getLong("pi_product_id"))
                            .imei(rs.getString("pi_imei"))
                            .status(ItemStatus.valueOf(rs.getString("pi_status")))
                            .product(product)
                            .build();
                    location.getItems().add(item);
                }
            }
        });

        return new ArrayList<>(warehouseMap.values());
    }

    @Override
    public Optional<Warehouse> findById(Long id) {
        String sql = """
                SELECT w.id AS w_id, w.name AS w_name, w.address AS w_address,
                w.created_at, w.updated_at,
                l.id AS loc_id, l.zone_name, l.row_num, l.shelf_num, l.bin_num, l.capacity
                FROM warehouses w
                LEFT JOIN warehouse_locations l ON w.id = l.warehouse_id
                WHERE w.id = ?
                ORDER BY w.id ASC
                """;
        Map<Long, Warehouse> map = new LinkedHashMap<>();
        super.query(sql, rs -> {
            while (rs.next()) {
                Long warehouseId = rs.getLong("w_id");
                Warehouse warehouse = map.computeIfAbsent(id, k -> {
                    try {
                        Warehouse w = mapResultSet(rs);
                        w.setLocations(new ArrayList<>());
                        return w;
                    } catch (SQLException e) {
                        throw new RuntimeException(e);
                    }
                });
//
                long locId = rs.getLong("loc_id");
                if (!rs.wasNull() && locId > 0) {
                    WarehouseLocation item = WarehouseLocation
                            .builder()
                            .id(locId)
                            .warehouseId(id)
                            .zoneName(rs.getString("zone_name"))
                            .rowNum(rs.getString("row_num"))
                            .shelfNum(rs.getString("shelf_num"))
                            .binNum(rs.getString("bin_num"))
                            .capacity(rs.getLong("capacity"))
                            .build();
                    warehouse.getLocations().add(item);
                }
            }
        }, id);

        return map.values().stream().findFirst();
    }

    @Override
    public Warehouse save(Warehouse entity) {
        Timestamp now = Timestamp.from(Instant.now());
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO warehouses (name, address, created_at, updated_at) VALUES (?, ?, ?, ?)
                    """;
            Long id = insert(sql,
                    entity.getName(),
                    entity.getAddress(),
                    now,
                    now);
            entity.setCreatedAt(now.toInstant());
            entity.setUpdatedAt(now.toInstant());
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE warehouses SET name = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
                    """;
            executeQuery(sql,
                    entity.getName(),
                    entity.getAddress(),
                    now,
                    entity.getId());
        }
        return entity;
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM warehouses WHERE id = ?";
        executeQuery(sql, id);
    }

    private Warehouse mapResultSet(ResultSet rs) throws SQLException {
        return Warehouse.builder()
                .id(rs.getLong("w_id"))
                .name(rs.getString("w_name"))
                .address(rs.getString("w_address"))
                .createdAt(getInstant(rs, "created_at"))
                .updatedAt(getInstant(rs, "updated_at"))
                .build();
    }
}
