package org.dawn.backend.dto.auth;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class JwtResponse {
    private String accessToken;

    @JsonIgnore
    private String refreshToken;

    private Long userId;

    private String username;

    private Boolean isPasswordReset;
}
