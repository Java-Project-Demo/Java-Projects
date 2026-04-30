package org.dawn.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;


@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = "role")
@ToString(callSuper = true, exclude = {"password", "role"})
public class User extends AbstractMappedEntity {

    private Long id;

    private String username;

    private String fullName;

    private String email;

    private String password;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant lastLogin;

    private Long roleId;

    private String status;

    private Integer gender;

    private Instant dob;

    private String phoneNumber;

    private Role role;

    @Builder.Default
    private Boolean isPasswordReset = false;

    @Builder.Default
    private Boolean isDeleted = false;
}
