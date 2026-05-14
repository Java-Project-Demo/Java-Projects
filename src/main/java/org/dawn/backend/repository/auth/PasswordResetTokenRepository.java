package org.dawn.backend.repository.auth;

import org.dawn.backend.entity.PasswordResetToken;

import java.util.Optional;

public interface PasswordResetTokenRepository {

    PasswordResetToken save(PasswordResetToken token);

    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUserId(Long userId);

    void markUsed(Long id);
}
