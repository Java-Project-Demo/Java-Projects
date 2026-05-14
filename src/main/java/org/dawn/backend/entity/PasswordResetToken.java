package org.dawn.backend.entity;

import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    private Long id;

    private Long userId;

    private String token;

    private Instant expiryDate;

    @Builder.Default
    private Boolean used = false;

    private Instant createdAt;
}
