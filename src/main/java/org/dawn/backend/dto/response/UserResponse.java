package org.dawn.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserResponse extends BaseResponse {
    private Long id;

    private String username;

    private String fullName;

    private String email;

    private String role;

    private String status;

    private Integer gender;

    private Integer age;

    private String phoneNumber;

    private Boolean isPasswordReset;

    private Instant createdAt;

    private Boolean isDeleted;
}
