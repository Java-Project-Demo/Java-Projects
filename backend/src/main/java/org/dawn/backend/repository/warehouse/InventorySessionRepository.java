package org.dawn.backend.repository.warehouse;

import org.dawn.backend.entity.InventorySession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventorySessionRepository extends JpaRepository<InventorySession, Long> {
}
