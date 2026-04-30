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
        String sql = "SELECT * FROM warehouse_locations WHERE id = ?";
        return queryOne(sql, this::mapResultSet, id);
    }


    @Override
    public List<WarehouseLocation> findByWarehouseId(Long id) {
        String sql = "SELECT * FROM warehouse_locations WHERE warehouse_id = ?";
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
    public void saveAll(List<WarehouseLocation> entities) {
        String sql = """
                INSERT INTO warehouse_locations (warehouse_id, zone_name, row_num, shelf_num, bin_num)
                VALUES (?, ?, ?, ?, ?)
                """;
        List<Object[]> paramList = entities.stream().map(entity -> new Object[]{
                entity.getWarehouseId(),
                entity.getZoneName(),
                entity.getRowNum(),
                entity.getShelfNum(),
                entity.getBinNum()
        }).toList();
        executeBatch(sql, paramList);

    }

    @Override
    public WarehouseLocation save(WarehouseLocation entity) {
        String sql = """
                INSERT INTO warehouse_locations (warehouse_id, zone_name, row_num, shelf_num, bin_num)
                VALUES (?, ?, ?, ?, ?)
                """;
        Long id = insert(sql,
                entity.getWarehouseId(),
                entity.getZoneName(),
                entity.getRowNum(),
                entity.getShelfNum(),
                entity.getBinNum());
        entity.setId(id);
        return entity;
    }

    WarehouseLocation mapResultSet(ResultSet rs) throws SQLException {
        return WarehouseLocation.builder()
                .id(rs.getLong("id"))
                .warehouseId(rs.getLong("warehouse_id"))
                .zoneName(rs.getString("zone_name"))
                .rowNum(rs.getString("row_num"))
                .shelfNum(rs.getString("shelf_num"))
                .binNum(rs.getString("bin_num"))
                .build();
    }
}
