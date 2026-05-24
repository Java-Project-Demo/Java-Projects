package org.dawn.backend.repository.warranty;

import org.dawn.backend.constant.warranty.WarrantyStatus;
import org.dawn.backend.entity.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WarrantyRepository extends JpaRepository<Warranty, Long> {
    List<Warranty> findByProductItemId(Long itemId);

    Long countByStatusNot(WarrantyStatus status);
}
