package org.dawn.backend.service;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.constant.Message;
import org.dawn.backend.entity.User;
import org.dawn.backend.entity.UserDetailsImpl;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.UserRepository;
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
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.EMAIL_NOT_FOUND));
        } else {
            user = userRepository
                    .findByUsername(input)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USER_NOT_FOUND));
        }


        return UserDetailsImpl.build(user);
    }
}
