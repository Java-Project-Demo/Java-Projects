package org.dawn.backend.repository.warehouse;

import org.dawn.backend.entity.InventoryDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryDetailRepository extends JpaRepository<InventoryDetail, Long> {
    List<InventoryDetail> findBySessionId(Long sessionId);
}
