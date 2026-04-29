package org.dawn.backend.repository.warranty;

import org.dawn.backend.constant.WarrantyStatus;
import org.dawn.backend.entity.Warranty;
import org.dawn.backend.repository.base.BaseRepository;

import java.util.List;

public interface WarrantyRepository extends BaseRepository<Warranty, Long> {
    List<Warranty> findByProductItemId(Long itemId);

    Long countByStatusNot(WarrantyStatus status);
}
