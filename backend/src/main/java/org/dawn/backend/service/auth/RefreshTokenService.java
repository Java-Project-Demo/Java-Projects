package org.dawn.backend.service.auth;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.entity.RefreshToken;
import org.dawn.backend.entity.User;
import org.dawn.backend.exception.wrapper.ResourceExpiredException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.auth.RefreshTokenRepository;
import org.dawn.backend.repository.auth.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class RefreshTokenService {


    @Value("${app.jwtRefreshExpirationsMs}")
    private Long refreshTokenDurations;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;


    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USER_NOT_FOUND));

        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = RefreshToken
                .builder()
                .userId(userId)
                .expiryDate(Instant.now().plusMillis(refreshTokenDurations))
                .token(UUID.randomUUID().toString())
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return Optional.of(
                refreshTokenRepository
                        .findByToken(token)
                        .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.REFRESH_TOKEN_NOT_FOUND)));
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.deleteByToken(token.getToken());
            throw new ResourceExpiredException(Message.Exception.REFRESH_TOKEN_EXPIRED);
        }
        return token;
    }

    @Transactional
    public void deleteByUserId(Long userId) {
        userRepository
                .findById(userId)
                .ifPresent(refreshTokenRepository::deleteByUser);

    }

}
