package org.dawn.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.dawn.backend.constant.URole;

import java.io.Serial;
import java.io.Serializable;

@Getter
@AllArgsConstructor
@Builder
public class UserDetailsImpl implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String username;

    private String email;

    @JsonIgnore
    private String password;

    private URole role;


    public static UserDetailsImpl build(User user) {
        return UserDetailsImpl
                .builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .password(user.getPassword())
                .role(user.getRole().getName())
                .build();
    }

    public boolean isEnabled() {
        return true;
    }
}
