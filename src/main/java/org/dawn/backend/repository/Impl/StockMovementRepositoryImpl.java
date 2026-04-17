package org.dawn.backend.repository.Impl;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.MovementType;
import org.dawn.backend.entity.StockMovement;
import org.dawn.backend.repository.StockMovementRepository;
import org.dawn.backend.repository.base.AbstractRepository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Slf4j
public class StockMovementRepositoryImpl extends AbstractRepository<StockMovement, Long> implements StockMovementRepository {

    public StockMovementRepositoryImpl(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public List<StockMovement> findByProductId(Long productId) {
        String sql = "SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC";
        return queryList(sql, this::mapResultSet, productId);
    }

    @Override
    public StockMovement save(StockMovement entity) {
        Timestamp now = Timestamp.from(Instant.now());
        String sql = """
                INSERT INTO stock_movements
                (product_id, type, action_type, quantity, reference_id, created_by, note, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        Long id = insert(sql,
                entity.getProductId(),
                entity.getType().name(),
                entity.getActionType(),
                entity.getQuantity(),
                entity.getReferenceId(),
                entity.getCreatedBy(),
                entity.getNote(),
                now,
                now);
        entity.setId(id);
        entity.setCreatedAt(now.toInstant());
        entity.setUpdatedAt(now.toInstant());
        return entity;
    }

    @Override
    public Optional<StockMovement> findById(Long id) {
        String sql = "SELECT * FROM stock_movements WHERE id = ?";
        return queryOne(sql, this::mapResultSet, id);
    }

    @Override
    public List<StockMovement> findAll() {
        String sql = "SELECT * FROM stock_movements ORDER BY created_at DESC";
        return queryList(sql, this::mapResultSet);
    }

    private StockMovement mapResultSet(ResultSet rs) throws SQLException {
        return StockMovement.builder()
                .id(rs.getLong("id"))
                .productId(rs.getLong("product_id"))
                .type(MovementType.valueOf(rs.getString("type")))
                .actionType(rs.getString("action_type"))
                .quantity(rs.getInt("quantity"))
                .referenceId(rs.getLong("reference_id"))
                .createdBy(rs.getLong("created_by"))
                .note(rs.getString("note"))
                .createdAt(getInstant(rs, "created_at"))
                .updatedAt(getInstant(rs, "updated_at"))
                .build();
    }

    private Instant getInstant(ResultSet rs, String col) throws SQLException {
        Timestamp ts = rs.getTimestamp(col);
        return ts != null ? ts.toInstant() : null;
    }
}
