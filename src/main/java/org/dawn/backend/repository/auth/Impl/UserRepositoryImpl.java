package org.dawn.backend.repository.auth.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.response.PageResponse;
import org.dawn.backend.constant.auth.URole;
import org.dawn.backend.entity.Role;
import org.dawn.backend.entity.User;
import org.dawn.backend.repository.auth.UserRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Slf4j
public class UserRepositoryImpl extends AbstractRepository<User, Long> implements UserRepository {


    public UserRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }


    @Override
    public PageResponse<User> findAll(int page, int size) {
        String sqlQuery = """
                SELECT u.*, r.id AS r_id, r.name AS r_name, r.description AS r_description
                FROM users u JOIN roles r ON u.role_id = r.id
                WHERE u.is_deleted = 0
                ORDER BY u.created_at DESC
                OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
                """;
        String sqlCount = "SELECT COUNT(*) FROM users WHERE is_deleted = 0";
        long total = 0;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sqlCount);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) total = rs.getLong(1);
        } catch (SQLException e) {
            log.error("Count error", e);
        }
        List<User> content = queryList(sqlQuery, this::mapResultSet, page * size, size);

        return PageResponse
                .<User>builder()
                .content(content)
                .totalElements(total)
                .totalPages((int) Math.ceil((double) total / size))
                .number(page)
                .size(size)
                .build();
    }

    @Override
    public List<User> findAll() {
        String sql = """
                SELECT u.*, r.id AS r_id, r.name AS r_name, r.description AS r_description
                FROM users u JOIN roles r ON u.role_id = r.id
                WHERE u.is_deleted = 0
                ORDER BY u.created_at DESC
                """;
        return queryList(sql, this::mapResultSet);
    }

    @Override
    public Optional<User> findById(Long id) {
        String sql = """
                SELECT u.*, r.id AS r_id, r.name AS r_name, r.description AS r_description
                FROM users u JOIN roles r ON u.role_id = r.id
                WHERE u.id = ?
                """;
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public User save(User entity) {
        Timestamp now = Timestamp.from(Instant.now());
        Date dob = entity.getDob() != null ? new Date(entity.getDob().toEpochMilli()) : null;
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO users
                    (username, password, full_name, email, role_id, status, gender, date_of_birth, phone_number, is_password_reset, is_deleted, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
                    """;
            Long id = insert(sql,
                    entity.getUsername(),
                    entity.getPassword(),
                    entity.getFullName(),
                    entity.getEmail(),
                    entity.getRole().getId(),
                    entity.getStatus(),
                    entity.getGender(),
                    dob,
                    entity.getPhoneNumber(),
                    entity.getIsPasswordReset() ? 1 : 0,
                    now,
                    now);
            entity.setCreatedAt(now.toInstant());
            entity.setUpdatedAt(now.toInstant());
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE users
                    SET username = ?, password = ?, full_name = ?, email = ?, role_id = ?,
                        status = ?, gender = ?, date_of_birth = ?, phone_number = ?,
                        is_password_reset = ?, is_deleted = ?, updated_at = ?
                    WHERE id = ?
                    """;
            executeQuery(sql,
                    entity.getUsername(),
                    entity.getPassword(),
                    entity.getFullName(),
                    entity.getEmail(),
                    entity.getRole().getId(),
                    entity.getStatus(),
                    entity.getGender(),
                    dob,
                    entity.getPhoneNumber(),
                    entity.getIsPasswordReset() ? 1 : 0,
                    Boolean.TRUE.equals(entity.getIsDeleted()) ? 1 : 0,
                    now,
                    entity.getId());
        }
        return entity;
    }

    @Override
    public Optional<User> findByUsername(String username) {
        String sql = """
                SELECT u.*, r.id AS r_id, r.name AS r_name, r.description AS r_description
                FROM users u JOIN roles r ON u.role_id = r.id
                WHERE u.username = ?
                """;
        return queryOne(sql, this::mapResultSet, username);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        String sql = """
                SELECT u.*, r.id AS r_id, r.name AS r_name, r.description AS r_description
                FROM users u JOIN roles r ON u.role_id = r.id
                WHERE u.email = ?
                """;

        return queryOne(sql, this::mapResultSet, email);
    }

    @Override
    public boolean existsByRoleName(String roleName) {
        String sql = """
                SELECT COUNT(*)
                FROM users u JOIN roles r ON u.role_id = r.id
                WHERE r.name = ?
                """;
        return checkExists(sql, roleName);
    }

    @Override
    public boolean existsByUserName(String username) {
        String sql = """
                SELECT COUNT(*)
                FROM users
                WHERE username = ? AND is_deleted = 0
                """;
        return checkExists(sql, username);
    }



    @Override
    public void delete(Long id) {
        String sql = "UPDATE FROM users WHERE id = ?";
        executeQuery(sql, id);
    }


    // Helper Method
    private boolean checkExists(String sql, Object param) {
        try (Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setObject(1, param);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getLong(1) > 0;
            }
        } catch (SQLException e) {
            log.error("Exists check error", e);
        }
        return false;
    }


    private User mapResultSet(ResultSet rs) throws SQLException {
        Role role = Role.builder()
                .id(rs.getLong("r_id"))
                .name(URole.valueOf(rs.getString("r_name")))
                .description(rs.getString("r_description"))
                .build();

        int genderRaw = rs.getInt("gender");
        Integer gender = rs.wasNull() ? null : genderRaw;

        return User.builder()
                .id(rs.getLong("id"))
                .username(rs.getString("username"))
                .fullName(rs.getString("full_name"))
                .email(rs.getString("email"))
                .password(rs.getString("password"))
                .lastLogin(getInstant(rs, "last_login"))
                .role(role)
                .status(rs.getString("status"))
                .gender(gender)
                .dob(getInstant(rs, "date_of_birth"))
                .phoneNumber(rs.getString("phone_number"))
                .isPasswordReset(rs.getBoolean("is_password_reset"))
                .isDeleted(rs.getBoolean("is_deleted"))
                .createdAt(getInstant(rs, "created_at"))
                .updatedAt(getInstant(rs, "updated_at"))
                .build();
    }

}
