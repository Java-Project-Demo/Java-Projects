package org.dawn.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.annotation.Post;
import org.dawn.backend.config.annotation.Put;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.config.security.UserRoleSecurity;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.dto.request.ChangePasswordRequest;
import org.dawn.backend.dto.request.LoginRequest;
import org.dawn.backend.dto.response.JwtResponse;
import org.dawn.backend.dto.response.TokenRefreshResponse;
import org.dawn.backend.service.AuthService;


@RequiredArgsConstructor
@Slf4j
public class AuthController extends AbstractController {

    private final AuthService authService;


    @Post("/login")
    public ResponseObject<JwtResponse> login(HttpServletRequest req) {
        LoginRequest loginReq = body(req, LoginRequest.class);
        JwtResponse jwt = authService.login(loginReq);
        return ResponseObject.success(jwt);
    }


    @Post("/refresh-token")
    public ResponseObject<TokenRefreshResponse> refreshToken(HttpServletRequest req) {
        String refreshToken = getCookie(req, "jwt-refresh");
        return ResponseObject.success(authService.refreshToken(refreshToken));

    }

    @Put("/{id}/reset-password")
    public ResponseObject<String> resetPassword(HttpServletRequest req) {
        Long id = getPathId(req);
        UserRoleSecurity.authorize(id);
        return ResponseObject.success(authService.resetPassword(id, currentUser().username()));
    }

    @Put("/change-password")
    public ResponseObject<String> changePassword(HttpServletRequest req) {
        UserPrincipal currentUser = currentUser();
        log.info("Current user: {}", currentUser);
        if (currentUser == null) {
            return ResponseObject.error(401, "You need to login");
        }

        ChangePasswordRequest changeReq = body(req, ChangePasswordRequest.class);
        String message = authService.changePassword(currentUser.username(), changeReq);

        return ResponseObject.success(message);
    }
}
