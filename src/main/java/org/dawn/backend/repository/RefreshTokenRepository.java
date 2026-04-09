package org.dawn.backend.repository;

import org.dawn.backend.entity.RefreshToken;
import org.dawn.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    void deleteByToken(String token);

    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);

}
