package org.dawn.backend.dto.auth;

import lombok.Data;

@Data
public class ResetPasswordTokenRequest {
    private String token;
    private String newPassword;
    private String confirmPassword;
}
