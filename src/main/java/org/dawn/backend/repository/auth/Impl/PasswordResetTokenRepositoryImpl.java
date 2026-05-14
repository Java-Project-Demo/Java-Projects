package org.dawn.backend.repository.auth.Impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.entity.PasswordResetToken;
import org.dawn.backend.repository.auth.PasswordResetTokenRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.Instant;
import java.util.Optional;

@Slf4j
public class PasswordResetTokenRepositoryImpl extends AbstractRepository<PasswordResetToken, Long>
        implements PasswordResetTokenRepository {

    public PasswordResetTokenRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public PasswordResetToken save(PasswordResetToken entity) {
        String sql = """
                INSERT INTO password_reset_tokens (user_id, token, expiry_date, used, created_at)
                VALUES (?, ?, ?, ?, ?)
                """;
        Long id = insert(sql,
                entity.getUserId(),
                entity.getToken(),
                Timestamp.from(entity.getExpiryDate()),
                entity.getUsed() ? 1 : 0,
                Timestamp.from(Instant.now()));
        entity.setId(id);
        return entity;
    }

    @Override
    public Optional<PasswordResetToken> findByToken(String token) {
        String sql = "SELECT * FROM password_reset_tokens WHERE token = ?";
        return queryOne(sql, this::mapResultSet, token);
    }

    @Override
    public void deleteByUserId(Long userId) {
        String sql = "DELETE FROM password_reset_tokens WHERE user_id = ?";
        executeQuery(sql, userId);
    }

    @Override
    public void markUsed(Long id) {
        String sql = "UPDATE password_reset_tokens SET used = 1 WHERE id = ?";
        executeQuery(sql, id);
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM password_reset_tokens WHERE id = ?";
        executeQuery(sql, id);
    }

    private PasswordResetToken mapResultSet(ResultSet rs) throws SQLException {
        Timestamp expiry = rs.getTimestamp("expiry_date");
        Timestamp created = rs.getTimestamp("created_at");
        return PasswordResetToken.builder()
                .id(rs.getLong("id"))
                .userId(rs.getLong("user_id"))
                .token(rs.getString("token"))
                .expiryDate(expiry != null ? expiry.toInstant() : null)
                .used(rs.getInt("used") == 1)
                .createdAt(created != null ? created.toInstant() : null)
                .build();
    }
}
