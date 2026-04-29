package org.dawn.backend.repository.auth.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.entity.RefreshToken;
import org.dawn.backend.entity.User;
import org.dawn.backend.repository.auth.RefreshTokenRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;

@Slf4j
public class RefreshTokenRepositoryImpl extends AbstractRepository<RefreshToken, Long> implements RefreshTokenRepository {

    public RefreshTokenRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public RefreshToken save(RefreshToken entity) {
        Timestamp now = Timestamp.from(Instant.now());
        String sql = """
                INSERT INTO refresh_tokens
                (user_id, token, expiry_date)
                VALUES (?, ?, ?)
                """;
        Long id = insert(sql,
                entity.getUser().getId(),
                entity.getToken(),
                Timestamp.from(entity.getExpiryDate()));
        entity.setId(id);

        return entity;
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM refresh_tokens WHERE id = ?";
        executeQuery(sql, id);
    }

    @Override
    public void deleteByToken(String token) {
        String sql = "DELETE FROM refresh_tokens WHERE token = ?";
        executeQuery(sql, token);
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        String sql = """
                SELECT rt.*, u.username, u.email
                FROM refresh_tokens rt
                JOIN users u ON rt.user_id = u.id
                WHERE rt.token = ?
                """;

        return queryOne(sql, this::mapResultSet, token);
    }

    @Override
    public void deleteByUser(User user) {
        String sql = "DELETE FROM refresh_tokens WHERE id = ?";
        executeQuery(sql, user.getId());
    }

    private RefreshToken mapResultSet(ResultSet rs) throws SQLException {
        User user = User.builder()
                .id(rs.getLong("user_id"))
                .username(rs.getString("username"))
                .email(rs.getString("email"))
                .build();

        return RefreshToken.builder()
                .id(rs.getLong("id"))
                .token(rs.getString("token"))
                .user(user)
                .expiryDate(getInstant(rs, "expiry_date"))
                .build();
    }

}
