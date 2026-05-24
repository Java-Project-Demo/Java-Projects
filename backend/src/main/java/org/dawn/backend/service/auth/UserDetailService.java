package org.dawn.backend.service.auth;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.entity.User;
import org.dawn.backend.entity.UserDetailsImpl;
import org.dawn.backend.repository.auth.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String input) throws UsernameNotFoundException {
        User user;
        if (input.contains("@")) {
            user = userRepository
                    .findByEmail(input)
                    .orElseThrow(() -> new UsernameNotFoundException(Message.Exception.EMAIL_NOT_FOUND));
        } else {
            user = userRepository
                    .findByUsername(input)
                    .orElseThrow(() -> new UsernameNotFoundException(Message.Exception.USERNAME_NOT_FOUND));
        }

        return UserDetailsImpl.build(user);
    }
}
