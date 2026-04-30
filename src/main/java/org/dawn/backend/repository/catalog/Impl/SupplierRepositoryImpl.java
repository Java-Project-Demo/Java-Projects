package org.dawn.backend.repository.catalog.Impl;

import org.dawn.backend.constant.system.ActiveStatus;
import org.dawn.backend.entity.Supplier;
import org.dawn.backend.repository.base.AbstractRepository;
import org.dawn.backend.repository.catalog.SupplierRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public class SupplierRepositoryImpl extends AbstractRepository<Supplier, Long> implements SupplierRepository {
    public SupplierRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<Supplier> findAll() {
        String sql = "SELECT * FROM suppliers";
        return queryList(sql, this::mapResultSet);
    }

    @Override
    public Optional<Supplier> findById(Long id) {
        String sql = "SELECT * FROM suppliers WHERE id = ?";
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public Optional<Supplier> findByName(String name) {
        String sql = "SELECT * FROM suppliers WHERE name = ?";
        return queryOne(sql, this::mapResultSet, name);
    }

    @Override
    public Supplier save(Supplier entity) {
        Timestamp now = Timestamp.from(Instant.now());
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO suppliers (name, contact_person, phone_number, email, address, tax_code, status, is_deleted, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """;
            Long id = insert(
                    sql,
                    entity.getName(),
                    entity.getContactPerson(),
                    entity.getPhoneNumber(),
                    entity.getEmail(),
                    entity.getAddress(),
                    entity.getTaxCode(),
                    ActiveStatus.INACTIVE.name(),
                    entity.getIsDeleted() ? 1 : 0,
                    now,
                    now);
            entity.setStatus(ActiveStatus.INACTIVE);
            entity.setCreatedAt(now.toInstant());
            entity.setUpdatedAt(now.toInstant());
            entity.setId(id);
        } else {
            String sql = """
                    UPDATE suppliers
                    SET name = ?, contact_person = ?, phone_number = ?, email = ?, address = ?, tax_code = ?, status = ?, is_deleted = ?, updated_at = ?
                    WHERE id = ?
                    """;
            executeQuery(sql,
                    entity.getName(),
                    entity.getContactPerson(),
                    entity.getPhoneNumber(),
                    entity.getEmail(),
                    entity.getAddress(),
                    entity.getTaxCode(),
                    entity.getStatus().name(),
                    entity.getIsDeleted() ? 1 : 0,
                    now, entity.getId());
        }
        return entity;
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM suppliers WHERE id = ?";
        executeQuery(sql, id);
    }


    private Supplier mapResultSet(ResultSet rs) throws SQLException {
        return Supplier.builder()
                .id(rs.getLong("id"))
                .name(rs.getString("name"))
                .contactPerson(rs.getString("contact_person"))
                .phoneNumber(rs.getString("phone_number"))
                .email(rs.getString("email"))
                .address(rs.getString("address"))
                .taxCode(rs.getString("tax_code"))
                .status(ActiveStatus.valueOf(rs.getString("status")))
                .isDeleted(rs.getBoolean("is_deleted"))
                .createdAt(getInstant(rs, "created_at"))
                .updatedAt(getInstant(rs, "updated_at"))
                .build();
    }
}
