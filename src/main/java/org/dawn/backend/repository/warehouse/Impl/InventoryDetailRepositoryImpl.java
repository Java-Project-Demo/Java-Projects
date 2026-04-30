package org.dawn.backend.repository.warehouse.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.inventory.DetailStatus;
import org.dawn.backend.entity.InventoryDetail;
import org.dawn.backend.repository.base.AbstractRepository;
import org.dawn.backend.repository.warehouse.InventoryDetailRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Slf4j
public class InventoryDetailRepositoryImpl extends AbstractRepository<InventoryDetail, Long> implements InventoryDetailRepository {
    public InventoryDetailRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<InventoryDetail> findBySessionId(Long sessionId) {
        String sql = "SELECT * FROM inventory_details WHERE session_id = ? ORDER BY id ASC";
        return queryList(sql, this::mapResultSet, sessionId);
    }

    @Override
    public InventoryDetail save(InventoryDetail entity) {
        String sql = """
                INSERT INTO inventory_details (session_id, imei, expected_loc, actual_loc, record_status, note)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        Long id = insert(sql,
                entity.getSessionId(),
                entity.getImei(),
                entity.getExpectedLoc(),
                entity.getActualLoc(),
                entity.getRecordStatus().name(),
                entity.getNote()
        );
        entity.setId(id);
        return entity;
    }

    @Override
    public void saveAll(List<InventoryDetail> entities) {
        String sql = """
                INSERT INTO inventory_details (session_id, imei, expected_loc, actual_loc, record_status, note)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        List<Object[]> paramsList = entities.stream().map(entity -> new Object[]{
                entity.getSessionId(),
                entity.getImei(),
                entity.getExpectedLoc(),
                entity.getActualLoc(),
                entity.getRecordStatus().name(),
                entity.getNote()
        }).toList();

        executeBatch(sql, paramsList);
    }

    private InventoryDetail mapResultSet(ResultSet rs) throws SQLException {
        return InventoryDetail.builder()
                .id(rs.getLong("id"))
                .sessionId(rs.getLong("session_id"))
                .imei(rs.getString("imei"))
                .expectedLoc(rs.getObject("expected_loc") != null ? rs.getLong("expected_loc") : null)
                .actualLoc(rs.getObject("actual_loc") != null ? rs.getLong("actual_loc") : null)
                .recordStatus(DetailStatus.valueOf(rs.getString("record_status")))
                .note(rs.getString("note"))
                .build();
    }
}
