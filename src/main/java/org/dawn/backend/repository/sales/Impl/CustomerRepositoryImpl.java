package org.dawn.backend.repository.sales.Impl;

import org.dawn.backend.entity.Customer;
import org.dawn.backend.repository.sales.CustomerRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public class CustomerRepositoryImpl extends AbstractRepository<Customer, Long> implements CustomerRepository {
    public CustomerRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<Customer> findAll() {
        String sql = """
                SELECT * FROM customers
                ORDER BY created_at DESC
                """;
        return queryList(sql, this::mapResultSet);
    }


    @Override
    public Optional<Customer> findById(Long id) {
        String sql = "SELECT * FROM customers WHERE id = ?";
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public Optional<Customer> findByEmail(String email) {
        String sql = "SELECT * FROM customers WHERE email = ?";
        return queryOne(sql, this::mapResultSet, email);
    }

    @Override
    public Optional<Customer> findByPhoneNumber(String phoneNumber) {
        String sql = "SELECT * FROM customers WHERE phone_number = ?";
        return queryOne(sql, this::mapResultSet, phoneNumber);
    }

    @Override
    public Customer save(Customer entity) {
        Timestamp now = Timestamp.from(Instant.now());
        if (entity.getId() == null) {
            String sql = """
                    INSERT INTO customers (phone_number, full_name, email, address, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """;
            Long id = insert(sql,
                    entity.getPhoneNumber(),
                    entity.getFullName(),
                    entity.getEmail(),
                    entity.getAddress(),
                    now,
                    now);
            entity.setId(id);
            entity.setCreatedAt(now.toInstant());
        } else {
            String sql = """
                    UPDATE customers
                    SET phone_number = ?, full_name = ?, email = ?, address = ?, updated_at = ?
                    WHERE id = ?
                    """;
            executeQuery(sql,
                    entity.getPhoneNumber(),
                    entity.getFullName(),
                    entity.getEmail(),
                    entity.getAddress(),
                    now,
                    entity.getId());
        }
        entity.setUpdatedAt(now.toInstant());
        return entity;
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM customers WHERE id = ?";
        executeQuery(sql, id);
    }

    private Customer mapResultSet(ResultSet rs) throws SQLException {
        return Customer
                .builder()
                .id(rs.getLong("id"))
                .phoneNumber(rs.getString("phone_number"))
                .fullName(rs.getString("full_name"))
                .email(rs.getString("email"))
                .address(rs.getString("address"))
                .createdAt(getInstant(rs, "created_at"))
                .updatedAt(getInstant(rs, "updated_at"))
                .build();

    }
}
