package org.dawn.backend.config.security;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.constant.Message;
import org.dawn.backend.entity.Role;
import org.dawn.backend.entity.User;
import org.dawn.backend.exception.wrapper.PermissionDeniedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("roleSecurity")
@RequiredArgsConstructor
public class UserRoleSecurity {

    private final UserRepository userRepository;

    public boolean canUpdate(Long userId, Authentication auth) {
        String currentUsername = auth.getName();

        User currentUser = userRepository
                .findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USER_NOT_FOUND));

        //  Can not update youself
        if (currentUser.getId().equals(userId)) {
            throw new PermissionDeniedException(Message.Exception.PERMISSION_DENIED);
        }

        User targetUser = userRepository
                .findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USER_NOT_FOUND));

        int currentUserRole = getMaxRole(currentUser.getRole());
        int targetUserRole = getMaxRole(targetUser.getRole());

        if (currentUserRole >= targetUserRole) {
            throw new PermissionDeniedException(Message.Exception.PERMISSION_DENIED);
        }
        ;
        return true;
    }

    private int getMaxRole(Role role) {
        return role.getName().getLevel();
    }
}
