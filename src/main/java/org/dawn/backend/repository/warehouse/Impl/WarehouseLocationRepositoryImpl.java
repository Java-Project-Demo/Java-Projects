package org.dawn.backend.repository.warehouse.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.entity.WarehouseLocation;
import org.dawn.backend.repository.base.AbstractRepository;
import org.dawn.backend.repository.warehouse.WarehouseLocationRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Slf4j
public class WarehouseLocationRepositoryImpl extends AbstractRepository<WarehouseLocation, Long> implements WarehouseLocationRepository {
    public WarehouseLocationRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public Optional<WarehouseLocation> findById(Long id) {
        String sql = "SELECT id, warehouse_id, zone_name, row_num, shelf_num, bin_num, capacity FROM warehouse_locations WHERE id = ?";
        return queryOne(sql, this::mapResultSet, id);
    }


    @Override
    public List<WarehouseLocation> findByWarehouseId(Long id) {
        String sql = "SELECT id, warehouse_id, zone_name, row_num, shelf_num, bin_num, capacity FROM warehouse_locations WHERE warehouse_id = ?";
        return queryList(sql, this::mapResultSet, id);
    }

    @Override
    public List<WarehouseLocation> findEmptyLocations() {
        String sql = """
                SELECT * FROM warehouse_locations
                WHERE id NOT IN (
                    SELECT location_id FROM product_items
                    WHERE status = 'AVAILABLE' AND location_id IS NOT NULL
                )
                ORDER BY id ASC
                """;

        return queryList(sql, this::mapResultSet);
    }

    @Override
    public List<WarehouseLocation> findAvailableLocationsByWarehouseId(Long warehouseId, Long productId) {
        String sql = """
                SELECT wl.*,
                    COUNT(pi.id) AS current_count
                FROM warehouse_locations wl
                LEFT JOIN product_items pi
                    ON pi.location_id = wl.id AND pi.status = 'AVAILABLE'
                WHERE wl.warehouse_id = ?
                  AND wl.id NOT IN (
                    SELECT DISTINCT location_id FROM product_items
                    WHERE status = 'AVAILABLE'
                        AND location_id IS NOT NULL
                        AND product_id != ?
                )
                GROUP BY wl.id, wl.warehouse_id, wl.zone_name,
                        wl.row_num, wl.shelf_num, wl.bin_num, wl.capacity
                ORDER BY wl.id ASC
                """;

        return queryList(sql, this::mapResultSet, warehouseId, productId);
    }

    @Override
    public long countAvailableItemsByLocationId(Long locationId) {
        String sql = """
                SELECT COUNT(*) FROM product_items
                WHERE location_id = ? AND status = 'AVAILABLE'
                """;
        return count(sql, locationId);
    }

    @Override
    public boolean hasOtherProductInLocation(Long locationId, Long productId) {
        String sql = """
                SELECT COUNT(*) FROM product_items
                WHERE location_id = ?
                   AND status = 'AVAILABLE'
                   AND product_id != ?
                """;
        return count(sql, locationId, productId) > 0;
    }

    @Override
    public void saveAll(List<WarehouseLocation> entities) {
        String sql = """
                INSERT INTO warehouse_locations (warehouse_id, zone_name, row_num, shelf_num, bin_num, capacity)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        List<Object[]> paramList = entities.stream().map(entity -> new Object[]{
                entity.getWarehouseId(),
                entity.getZoneName(),
                entity.getRowNum(),
                entity.getShelfNum(),
                entity.getBinNum(),
                entity.getCapacity()
        }).toList();
        executeBatch(sql, paramList);

    }

    @Override
    public WarehouseLocation save(WarehouseLocation entity) {
        String sql = """
                INSERT INTO warehouse_locations (warehouse_id, zone_name, row_num, shelf_num, bin_num, capacity)
                VALUES (?, ?, ?, ?, ?)
                """;
        Long id = insert(sql,
                entity.getWarehouseId(),
                entity.getZoneName(),
                entity.getRowNum(),
                entity.getShelfNum(),
                entity.getBinNum(),
                entity.getCapacity());
        entity.setId(id);
        return entity;
    }

    WarehouseLocation mapResultSet(ResultSet rs) throws SQLException {
        long capacity = 20;
        long currentCount = 0;
        try {
            capacity = rs.getLong("capacity");
        } catch (SQLException e) {
        }
        try {
            currentCount = rs.getLong("current_count");
        } catch (SQLException e) {
        }

        return WarehouseLocation.builder()
                .id(rs.getLong("id"))
                .warehouseId(rs.getLong("warehouse_id"))
                .zoneName(rs.getString("zone_name"))
                .rowNum(rs.getString("row_num"))
                .shelfNum(rs.getString("shelf_num"))
                .binNum(rs.getString("bin_num"))
                .capacity(capacity)
                .currentCount(currentCount)
                .build();
    }
}
