package org.dawn.backend.repository.warehouse;

import org.dawn.backend.entity.InventoryDetail;
import org.dawn.backend.repository.base.BaseRepository;

import java.util.List;

public interface InventoryDetailRepository extends BaseRepository<InventoryDetail, Long> {
    List<InventoryDetail> findBySessionId(Long sessionId);

    void saveAll(List<InventoryDetail> entities);
}
