package org.dawn.backend.config.security;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.utils.JWTUtils;

@RequiredArgsConstructor
@Slf4j
public class AuthTokenFilter {

    private final JWTUtils jwtUtils;

    public UserPrincipal authenticated(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        String jwt = header.substring(7);
        if (jwtUtils.validateToken(jwt)) {
            return new UserPrincipal(
                    jwtUtils.getUserIdFromToken(jwt),
                    jwtUtils.getUserNameFromToken(jwt),
                    jwtUtils.getRoleFromToken(jwt)
            );

        }
        return null;
    }
}
