package org.dawn.backend.repository.catalog;

import org.dawn.backend.entity.Supplier;
import org.dawn.backend.repository.base.BaseRepository;

import java.util.Optional;

public interface SupplierRepository extends BaseRepository<Supplier, Long> {
    Optional<Supplier> findByName(String name);
}
