package org.dawn.backend.entity;


import lombok.*;

import java.time.Instant;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = "user")
@ToString(exclude = "user")
public class RefreshToken {

    private Long id;

    private Long userId;

    private String token;

    private Instant expiryDate;

    private User user;
}
