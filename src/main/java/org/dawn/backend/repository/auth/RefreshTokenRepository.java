package org.dawn.backend.repository.auth;

import org.dawn.backend.entity.RefreshToken;
import org.dawn.backend.entity.User;
import org.dawn.backend.repository.base.BaseRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends BaseRepository<RefreshToken, Long> {
    void deleteByToken(String token);

    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);

}
