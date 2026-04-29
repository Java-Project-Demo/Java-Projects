package org.dawn.backend.repository.auth;

import org.dawn.backend.constant.URole;
import org.dawn.backend.entity.Role;
import org.dawn.backend.repository.base.BaseRepository;

import java.util.Optional;

public interface RoleRepository extends BaseRepository<Role, Long> {
    Optional<Role> findByName(URole name);
}
