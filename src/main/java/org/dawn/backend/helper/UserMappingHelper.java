package org.dawn.backend.helper;

import org.dawn.backend.dto.response.UserResponse;
import org.dawn.backend.entity.User;

public interface UserMappingHelper {

    static UserResponse map(final User u) {
        return UserResponse
                .builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole().getName().toString())
                .status(u.getStatus())
                .gender(u.getGender())
                .age(u.getAge())
                .phoneNumber(u.getPhoneNumber())
                .isPasswordReset(u.isPasswordReset())
                .isDeleted(u.getIsDeleted())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }

}
