package org.dawn.backend.repository;

import org.dawn.backend.entity.WarrantyClaim;
import org.dawn.backend.repository.base.BaseRepository;

import java.util.List;

public interface WarrantyClaimRepository extends BaseRepository<WarrantyClaim, Long> {
    List<WarrantyClaim> findByProductItemId(Long itemId);
}
