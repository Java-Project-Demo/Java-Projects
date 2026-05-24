package org.dawn.backend.repository.warranty;

import org.dawn.backend.constant.warranty.WarrantyStatus;
import org.dawn.backend.entity.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, Long> {
    List<Warranty> findByProductItemId(Long itemId);

    Long countByStatusNot(WarrantyStatus status);
}
