package org.dawn.backend.repository.auth;

import org.dawn.backend.config.response.PageResponse;
import org.dawn.backend.entity.User;
import org.dawn.backend.repository.base.BaseRepository;

import java.util.Optional;

public interface UserRepository extends BaseRepository<User, Long> {
    PageResponse<User> findAll(int page, int size);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);


    boolean existsByRoleName(String roleName);

    boolean existsByUserName(String username);
}

