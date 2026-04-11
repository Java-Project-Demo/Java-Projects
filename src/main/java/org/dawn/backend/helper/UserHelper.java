package org.dawn.backend.helper;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.entity.User;
import org.dawn.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserHelper {

    private final UserRepository userRepository;

    public Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return userRepository
                    .findByUsername(auth.getName())
                    .map(User::getId)
                    .orElse(null);
        }
        return null;
    }
}
