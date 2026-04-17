package org.dawn.backend.repository.base;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
public abstract class AbstractRepository<T, ID> implements BaseRepository<T, ID> {
    protected final DataSource dataSource;

    @Override
    public Optional<T> findById(ID id) {
        throw new UnsupportedOperationException("This method is not deploy in this repo");
    }

    @Override
    public List<T> findAll() {
        throw new UnsupportedOperationException("This method is not deploy in this repo");
    }

    @Override
    public T save(T entity) {
        throw new UnsupportedOperationException("This method is not deploy in this repo");
    }

    @Override
    public void delete(ID id) {
        throw new UnsupportedOperationException("This method is not deploy in this repo");
    }


    // For GET ALL
    protected List<T> queryList(String sql, RowMapper<T> mapper, Object... params) {
        List<T> list = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapper.map(rs));
            }
        } catch (SQLException e) {
            log.error("Query error: {}", sql, e);
        }
        return list;
    }

    // For GET ONE
    protected Optional<T> queryOne(String sql, RowMapper<T> mapper, Object... params) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) ps.setObject(i + 1, params[i]);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(mapper.map(rs));
            }
        } catch (SQLException e) {
            log.error("Query error: {}", sql, e);
        }
        return Optional.empty();
    }

    // For UPDATE and DELETE
    protected int executeQuery(String sql, Object... params) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            return ps.executeUpdate();
        } catch (SQLException e) {
            log.error("Execute error: {}", sql, e);
            return 0;
        }
    }

    //  For CREATE
    protected Long insert(String sql, Object... params) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, new String[]{"ID"})) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getLong(1);
            }
        } catch (SQLException e) {
            log.error("Execute error: {}", sql, e);

        }
        return null;
    }


    // For COUNT
    protected long count(String sql, Object... params) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong(1);
                }
            }
        } catch (SQLException e) {
            log.error("Count error: {}", sql, e);
        }
        return 0;
    }
}

