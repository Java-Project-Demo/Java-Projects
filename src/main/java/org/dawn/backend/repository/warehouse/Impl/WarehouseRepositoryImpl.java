package org.dawn.backend.repository.warehouse.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.entity.Warehouse;
import org.dawn.backend.entity.WarehouseLocation;
import org.dawn.backend.repository.base.AbstractRepository;
import org.dawn.backend.repository.warehouse.WarehouseRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
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
                l.id AS loc_id, l.zone_name, l.row_num, l.shelf_num, l.bin_num
                FROM warehouses w
                LEFT JOIN warehouse_locations l ON w.id = l.warehouse_id
                ORDER BY w.id ASC
                """;
        Map<Long, Warehouse> map = new LinkedHashMap<>();
        super.query(sql, rs -> {
            while (rs.next()) {
                Long id = rs.getLong("w_id");
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
                            .build();
                    warehouse.getLocations().add(item);
                }
            }
        });

        return new ArrayList<>(map.values());
    }

    @Override
    public Optional<Warehouse> findById(Long id) {
        String sql = """
                SELECT w.id AS w_id, w.name AS w_name, w.address AS w_address,
                l.id AS loc_id, l.zone_name, l.row_num, l.shelf_num, l.bin_num
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
                            .build();
                    warehouse.getLocations().add(item);
                }
            }
        }, id);

        return map.values().stream().findFirst();
    }

    @Override
    public Warehouse save(Warehouse entity) {
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO warehouses (name, address) VALUES (?, ?)
                    """;
            Long id = insert(sql,
                    entity.getName(),
                    entity.getAddress());
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE warehouses SET name = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
                    """;
            executeQuery(sql,
                    entity.getName(),
                    entity.getAddress(),
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
