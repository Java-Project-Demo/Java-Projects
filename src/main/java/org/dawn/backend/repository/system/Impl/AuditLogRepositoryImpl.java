package org.dawn.backend.repository.system.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.entity.AuditLog;
import org.dawn.backend.repository.system.AuditLogRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;


@Slf4j
public class AuditLogRepositoryImpl extends AbstractRepository<AuditLog, Long> implements AuditLogRepository {

    public AuditLogRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<AuditLog> search(String userId, String action, String status, LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        StringBuilder sql = new StringBuilder("""
                SELECT au.*, u.full_name AS staff_name, u.username AS staff_username
                FROM audit_logs au
                LEFT JOIN users u ON au.user_id = u.id
                WHERE 1=1
                """);
        List<Object> params = new ArrayList<>();


        if (userId != null && !userId.isBlank()) {
            sql.append(" AND au.user_id = ?");
            params.add(Long.valueOf(userId));
        }

        if (action != null && !action.isBlank()) {
            sql.append(" AND au.action = ?");
            params.add(action);
        }

        if (status != null && !status.isBlank()) {
            sql.append(" AND au.status = ?");
            params.add(status);
        }

        if (startDate != null) {
            sql.append(" AND au.created_at >= ?");
            params.add(Timestamp.valueOf(startDate));
        }

        if (endDate != null) {
            sql.append(" AND au.created_at <= ?");
            params.add(Timestamp.valueOf(endDate));
        }

        sql.append("""
                ORDER BY au.created_at
                DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
                """);
        params.add(page * size);
        params.add(size);
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

    @Override
    public List<AuditLog> findTop5OrderByCreatedAtDesc() {
        String sql = """
                SELECT au.*, u.full_name AS staff_name, u.username AS staff_username
                FROM audit_logs au
                LEFT JOIN users u ON au.user_id = u.id
                ORDER BY au.created_at DESC
                OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY
                """;
        return queryList(sql, this::mapResultSet);
    }

    private AuditLog mapResultSet(ResultSet rs) throws SQLException {
        Set<String> cols = new HashSet<>();
        ResultSetMetaData md = rs.getMetaData();
        for (int i = 1; i <= md.getColumnCount(); i++) {
            cols.add(md.getColumnLabel(i).toLowerCase());
        }
        return AuditLog.builder()
                .id(rs.getLong("id"))
                .userId(rs.getLong("user_id"))
                .action(rs.getString("action"))
                .entityName(rs.getString("entity_name"))
                .entityId(rs.getString("entity_id"))
                .status(rs.getString("status"))
                .details(rs.getString("details"))
                .staffName(cols.contains("staff_name") ? rs.getString("staff_name") : null)
                .staffUsername(cols.contains("staff_username") ? rs.getString("staff_username") : null)
                .createdAt(getInstant(rs, "created_at"))
                .updatedAt(getInstant(rs, "updated_at"))
                .build();
    }
}
