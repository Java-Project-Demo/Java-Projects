package org.dawn.backend.repository;

import org.dawn.backend.constant.URole;
import org.dawn.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(URole name);
}
