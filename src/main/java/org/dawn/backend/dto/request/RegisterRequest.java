package org.dawn.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RegisterRequest {
    private String fullName;
    private Integer gender;
    private String roleName;
    private Integer age;
    private String phoneNumber;
    private String email;
    private String status;
}
