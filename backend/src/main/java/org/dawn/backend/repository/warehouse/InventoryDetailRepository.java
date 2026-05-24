package org.dawn.backend.repository.warehouse;

import org.dawn.backend.entity.InventoryDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryDetailRepository extends JpaRepository<InventoryDetail, Long> {
    List<InventoryDetail> findBySessionId(Long sessionId);
}
