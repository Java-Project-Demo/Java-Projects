package org.dawn.backend.repository.base;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionContext;
import org.dawn.backend.constant.system.Message;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
public abstract class AbstractRepository<T, ID> implements BaseRepository<T, ID> {
    protected final DataSource dataSource;

    @Override
    public Optional<T> findById(ID id) {
        throw new UnsupportedOperationException(Message.Exception.METHOD_NOT_IMPLEMENTED);
    }

    @Override
    public List<T> findAll() {
        throw new UnsupportedOperationException(Message.Exception.METHOD_NOT_IMPLEMENTED);
    }

    @Override
    public T save(T entity) {
        throw new UnsupportedOperationException(Message.Exception.METHOD_NOT_IMPLEMENTED);
    }

    @Override
    public void delete(ID id) {
        throw new UnsupportedOperationException(Message.Exception.METHOD_NOT_IMPLEMENTED);
    }

    public interface ResultSetHandler {
        void handle(ResultSet rs) throws SQLException;
    }

    // For GET ALL
    protected List<T> queryList(String sql, RowMapper<T> mapper, Object... params) {
        List<T> list = new ArrayList<>();
        Connection conn = null;
        try {
            conn = getConnection();
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                setParams(ps, params);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) list.add(mapper.map(rs));
                }
            }
        } catch (SQLException e) {
            log.error("Query error: {}", sql, e);
            throw new RuntimeException(e);
        } finally {
            closeConnection(conn);
        }
        return list;
    }

    protected List<T> query(String sql, ResultSetHandler handler, Object... params) {
        Connection conn = null;
        try {
            conn = getConnection();
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                setParams(ps, params);
                try (ResultSet rs = ps.executeQuery()) {
                    handler.handle(rs);
                }
            }
        } catch (SQLException e) {
            log.error("Query error: {}", sql, e);
            throw new RuntimeException(e);
        } finally {
            closeConnection(conn);
        }
        return new ArrayList<>();
    }

    // For GET ONE
    protected Optional<T> queryOne(String sql, RowMapper<T> mapper, Object... params) {
        Connection conn = null;
        try {
            conn = getConnection();
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                setParams(ps, params);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) return Optional.of(mapper.map(rs));
                }
            }
        } catch (SQLException e) {
            log.error("Query error: {}", sql, e);
            throw new RuntimeException(e);
        } finally {
            closeConnection(conn);
        }
        return Optional.empty();
    }

    // For UPDATE and DELETE
    protected int executeQuery(String sql, Object... params) {
        Connection conn = null;
        try {
            conn = getConnection();
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                setParams(ps, params);
                return ps.executeUpdate();
            }
        } catch (SQLException e) {
            log.error("Execute error: {}", sql, e);
            throw new RuntimeException(e);
        } finally {
            closeConnection(conn);
        }
    }

    //  For CREATE
    protected Long insert(String sql, Object... params) {
        Connection conn = null;
        try {
            conn = getConnection();
            try (PreparedStatement ps = conn.prepareStatement(sql, new String[]{"ID"})) {
                setParams(ps, params);
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) return rs.getLong(1);
                }
            }
        } catch (SQLException e) {
            log.error("Execute error: {}", sql, e);
            throw new RuntimeException(e);
        } finally {
            closeConnection(conn);
        }
        return null;
    }


    protected void executeBatch(String sql, List<Object[]> paramsList) {
        Connection conn = null;
        boolean isExternalTransaction = TransactionContext.get() != null;
        try {
            conn = getConnection();
            if (!isExternalTransaction) conn.setAutoCommit(false);
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                for (Object[] params : paramsList) {
                    setParams(ps, params);
                    ps.addBatch();
                }
                ps.executeBatch();
                if (!isExternalTransaction) conn.commit();
            } catch (SQLException e) {
                if (!isExternalTransaction) conn.rollback();
                log.error("Batch execute error: {}", sql, e);
                throw new RuntimeException(Message.Exception.BATCH_SAVE_ERROR, e);
            }
        } catch (SQLException e) {
            log.error("Execute error", e);
            throw new RuntimeException(e);
        } finally {
            closeConnection(conn);
        }
    }

    // For COUNT
    protected long count(String sql, Object... params) {
        Connection conn = null;
        try {
            conn = getConnection();
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                setParams(ps, params);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) return rs.getLong(1);
                }
            }
        } catch (SQLException e) {
            log.error("Count error: {}", sql, e);
            throw new RuntimeException(e);
        } finally {
            closeConnection(conn);
        }
        return 0;
    }

    protected Instant getInstant(ResultSet rs, String col) throws SQLException {
        Timestamp ts = rs.getTimestamp(col);
        return ts != null ? ts.toInstant() : null;
    }

    private void setParams(PreparedStatement ps, Object... params) throws SQLException {
        for (int i = 0; i < params.length; i++) {
            Object val = params[i];
            int idx = i + 1;
            switch (val) {
                case null -> ps.setNull(idx, Types.NULL);
                case Enum anEnum -> ps.setString(idx, anEnum.name());
                case Instant instant -> ps.setTimestamp(idx, Timestamp.from(instant));
                case BigDecimal bigDecimal -> ps.setBigDecimal(idx, bigDecimal);
                default -> ps.setObject(idx, val);
            }
        }
    }

    private Connection getConnection() throws SQLException {
        Connection conn = TransactionContext.get();
        if (conn != null) return conn;
        return dataSource.getConnection();
    }

    private void closeConnection(Connection conn) {
        try {
            if (conn != null && TransactionContext.get() == null) {
                conn.close();
            }
        } catch (SQLException e) {
            log.error("Error closing connection", e);
        }
    }
}

