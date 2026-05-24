package org.dawn.backend.config.security;


import lombok.RequiredArgsConstructor;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.entity.User;
import org.dawn.backend.entity.UserDetailsImpl;
import org.dawn.backend.exception.wrapper.PermissionDeniedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.auth.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("roleSecurity")
@RequiredArgsConstructor
public class UserRoleSecurity {

    private final UserRepository userRepository;

    public boolean canUpdate(Long userId, Authentication auth) {
        UserDetailsImpl currentUser = (UserDetailsImpl) auth.getPrincipal();

        //  Can not update youself
        if (currentUser.getId().equals(userId)) {
            throw new PermissionDeniedException(Message.Exception.PERMISSION_DENIED);
        }

        User targetUser = userRepository
                .findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USER_NOT_FOUND));

        int currentUserRole = currentUser.getRole().getLevel();
        int targetUserRole = targetUser.getRole().getName().getLevel();

        if (currentUserRole >= targetUserRole) {
            throw new PermissionDeniedException(Message.Exception.PERMISSION_DENIED);
        }
        return true;
    }

}
