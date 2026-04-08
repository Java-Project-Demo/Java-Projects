package org.dawn.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ChangePasswordRequest {
    private String oldPassword;

    private String newPassword;

    private String confirmPassword;
}
