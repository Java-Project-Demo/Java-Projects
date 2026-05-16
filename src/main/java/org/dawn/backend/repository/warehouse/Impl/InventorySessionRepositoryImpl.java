package org.dawn.backend.repository.warehouse.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.inventory.SessionStatus;
import org.dawn.backend.entity.InventorySession;
import org.dawn.backend.repository.base.AbstractRepository;
import org.dawn.backend.repository.warehouse.InventorySessionRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Slf4j
public class InventorySessionRepositoryImpl extends AbstractRepository<InventorySession, Long> implements InventorySessionRepository {
    public InventorySessionRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<InventorySession> findAll() {
        String sql = "SELECT * FROM inventory_sessions ORDER BY start_date DESC";
        return queryList(sql, this::mapResultSet);
    }

    @Override
    public Optional<InventorySession> findById(Long id) {
        String sql = "SELECT * FROM inventory_sessions WHERE id = ?";
        return queryOne(sql, this::mapResultSet, id);
    }


    @Override
    public InventorySession save(InventorySession entity) {
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO inventory_sessions (warehouse_id, created_by, status, start_date)
                    VALUES (?, ?, ?, ?)
                    """;
            Long id = insert(sql,
                    entity.getWarehouseId(),
                    entity.getCreatedBy(),
                    entity.getStatus().name(),
                    entity.getStartDate() != null ? Timestamp.from(entity.getStartDate()) : Timestamp.from(Instant.now())
            );
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE inventory_sessions
                    SET status = ?, end_date = ?
                    WHERE id = ?
                    """;
            executeQuery(sql,
                    entity.getStatus().name(),
                    entity.getEndDate() != null ? Timestamp.from(entity.getEndDate()) : Timestamp.from(Instant.now()),
                    entity.getId()
            );
        }
        return entity;
    }

    private InventorySession mapResultSet(ResultSet rs) throws SQLException {
        long w = rs.getLong("warehouse_id");
        Long warehouseId = rs.wasNull() ? null : w;
        return InventorySession.builder()
                .id(rs.getLong("id"))
                .warehouseId(warehouseId)
                .createdBy(rs.getLong("created_by"))
                .status(SessionStatus.valueOf(rs.getString("status")))
                .startDate(getInstant(rs, "start_date"))
                .endDate(getInstant(rs, "end_date"))
                .build();
    }
}
