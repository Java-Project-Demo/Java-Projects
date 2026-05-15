package org.dawn.backend.config.security;


import org.dawn.backend.constant.system.Message;
import org.dawn.backend.exception.wrapper.PermissionDeniedException;

public class UserRoleSecurity {
    public static void authorize(Long targetUserId) {
        UserPrincipal user = SecurityContext.get();

        boolean isAdmin = "ADMIN".equals(user.role());
        boolean isOwner = user.id().equals(targetUserId);

        if (!isAdmin && !isOwner) {
            throw new PermissionDeniedException(Message.Exception.PERMISSION_DENIED);
        }
    }

}
