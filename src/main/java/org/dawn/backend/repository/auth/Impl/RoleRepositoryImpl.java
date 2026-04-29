package org.dawn.backend.repository.auth.Impl;

import org.dawn.backend.constant.URole;
import org.dawn.backend.entity.Role;
import org.dawn.backend.repository.auth.RoleRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public class RoleRepositoryImpl extends AbstractRepository<Role, Long> implements RoleRepository {

    public RoleRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public Optional<Role> findByName(URole name) {
        String sql = "SELECT * FROM roles WHERE name = ?";
        return queryOne(sql, this::mapResultSet, name.name());
    }

    @Override
    public Optional<Role> findById(Long id) {
        String sql = "SELECT * FROM roles WHERE id = ?";
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public List<Role> findAll() {
        String sql = "SELECT * FROM roles ORDER BY name ASC";
        return queryList(sql, this::mapResultSet);
    }

    @Override
    public Role save(Role entity) {
        Timestamp now = Timestamp.from(Instant.now());
        if (entity.getId() == null) {
            String sql = "INSERT INTO roles (name, description, created_at, updated_at) VALUES (?, ?, ?, ?)";
            Long id = insert(sql,
                    entity.getName().name(),
                    entity.getDescription(),
                    now,
                    now
            );
            entity.setId(id);
        } else {
            String sql = "UPDATE roles SET name = ?, description = ?, updated_at = ? WHERE id = ?";
            executeQuery(sql,
                    entity.getName().name(),
                    entity.getDescription(),
                    now,
                    entity.getId()
            );
        }
        return entity;
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM roles WHERE id = ?";
        executeQuery(sql, id);
    }

    private Role mapResultSet(ResultSet rs) throws SQLException {
        return Role.builder()
                .id(rs.getLong("id"))
                .name(URole.valueOf(rs.getString("name")))
                .description(rs.getString("description"))
                .createdAt(getInstant(rs, "created_at"))
                .updatedAt(getInstant(rs, "updated_at"))
                .build();
    }

}
