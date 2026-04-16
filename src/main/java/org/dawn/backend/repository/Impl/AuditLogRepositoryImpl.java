package org.dawn.backend.repository.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.entity.AuditLog;
import org.dawn.backend.repository.AuditLogRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Slf4j
public class AuditLogRepositoryImpl extends AbstractRepository<AuditLog, Long> implements AuditLogRepository {

    public AuditLogRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<AuditLog> search(String userId, String action, String status, LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        StringBuilder sql = new StringBuilder("SELECT * FROM audit_logs WHERE 1=1");
        List<Object> params = new ArrayList<>();


        if (userId != null && !userId.isBlank()) {
            sql.append(" AND LOWER(user_id) LIKE ?");
            params.add("%" + userId.toLowerCase() + "%");
        }

        if (action != null && !action.isBlank()) {
            sql.append(" AND action = ?");
            params.add(action);
        }

        if (status != null && !status.isBlank()) {
            sql.append(" AND status = ?");
            params.add(status);
        }

        if (startDate != null) {
            sql.append(" AND created_at >= ?");
            params.add(startDate);
        }

        if (endDate != null) {
            sql.append(" AND created_at <= ?");
            params.add(endDate);
        }

        sql.append(" ORDER BY created_at DESC LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);
        return queryList(sql.toString(), this::mapResultSet, params.toArray());
    }

    @Override
    public List<AuditLog> findAll() {
        String sql = """
                SELECT * FROM audit_logs ORDER BY created_at DESC
                """;
        return queryList(sql, this::mapResultSet);
    }

    @Override
    public Optional<AuditLog> findById(Long id) {
        String sql = "SELECT * FROM audit_logs WHERE id = ?";
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public AuditLog save(AuditLog entity) {
        String sql = """
                INSERT INTO audit_logs
                (user_id, action, entity_name, entity_id, status, details, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;
        Timestamp now = Timestamp.from(Instant.now());
        Long id = insert(sql,
                entity.getUserId(),
                entity.getAction(),
                entity.getEntityName(),
                entity.getEntityId(),
                entity.getStatus(),
                entity.getDetails(),
                now,
                now);
        entity.setId(id);
        entity.setCreatedAt(now.toInstant());
        return entity;
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM audit_logs WHERE id = ?";
        executeQuery(sql, id);
    }

    @Override
    public int deleteOlderThan(LocalDateTime threshold) {
        String sql = "DELETE FROM audit_logs WHERE created_at < ?";
        return executeQuery(sql, threshold);
    }

    private AuditLog mapResultSet(ResultSet rs) throws SQLException {
        return AuditLog.builder()
                .id(rs.getLong("id"))
                .userId(rs.getString("user_id"))
                .action(rs.getString("action"))
                .entityName(rs.getString("entity_name"))
                .entityId(rs.getString("entity_id"))
                .status(rs.getString("status"))
                .details(rs.getString("details"))
                .createdAt(rs.getTimestamp("created_at").toInstant())
                .updatedAt(rs.getTimestamp("updated_at").toInstant())
                .build();
    }


}
