package org.dawn.backend.repository.warehouse;

import org.dawn.backend.entity.StockMovement;
import org.dawn.backend.repository.base.BaseRepository;

import java.util.List;

public interface StockMovementRepository extends BaseRepository<StockMovement, Long> {
    List<StockMovement> findByProductId(Long productId);
}
