package org.dawn.backend.repository.system;

import jakarta.transaction.Transactional;
import org.dawn.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {
    @Modifying
    @Transactional
    @Query("DELETE FROM AuditLog a WHERE a.createdAt < :threshold")
    void deleteOlderThan(@Param("threshold") Instant threshold);


    @Query(value = """
            SELECT au.*, u.full_name AS staff_name, u.username AS staff_username
            FROM audit_logs au
            LEFT JOIN users u ON au.user_id = u.id
            ORDER BY au.created_at DESC
            LIMIT 5
            """, nativeQuery = true)
    List<AuditLog> findTop5OrderByCreatedAtDesc();

}
