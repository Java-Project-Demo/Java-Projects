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
import java.util.List;
import java.util.Optional;


@Slf4j
public class AuditLogRepositoryImpl extends AbstractRepository<AuditLog, Long> implements AuditLogRepository {

    public AuditLogRepositoryImpl(DataSource dataSource) {
        super(dataSource);
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
