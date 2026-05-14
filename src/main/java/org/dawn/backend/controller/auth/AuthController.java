package org.dawn.backend.controller.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.AppConfig;
import org.dawn.backend.config.web.annotation.Post;
import org.dawn.backend.config.web.annotation.Put;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.config.security.UserRoleSecurity;
import org.dawn.backend.controller.base.AbstractController;
import org.dawn.backend.dto.auth.ChangePasswordRequest;
import org.dawn.backend.dto.auth.ForgotPasswordRequest;
import org.dawn.backend.dto.auth.LoginRequest;
import org.dawn.backend.dto.auth.JwtResponse;
import org.dawn.backend.dto.auth.ResetPasswordTokenRequest;
import org.dawn.backend.dto.auth.TokenRefreshResponse;
import org.dawn.backend.service.auth.AuthService;
import org.dawn.backend.utils.JWTUtils;


@RequiredArgsConstructor
@Slf4j
public class AuthController extends AbstractController {

    private final AuthService authService;
    private final JWTUtils jwtUtils;

    @Post("/login")
    public ResponseObject<JwtResponse> login(HttpServletRequest req, HttpServletResponse res) {
        LoginRequest loginReq = body(req, LoginRequest.class);
        JwtResponse jwt = authService.login(loginReq);
        Cookie refreshToken = jwtUtils.generateJwtRefreshCookie(jwt.getRefreshToken());
        res.addCookie(refreshToken);
        return ResponseObject.success(jwt);
    }


    @Post("/refresh-token")
    public ResponseObject<TokenRefreshResponse> refreshToken(HttpServletRequest req, HttpServletResponse res) {
        String refreshToken = getCookie(req, AppConfig.get("app.jwtRefreshCookieName"));
        log.info("Nhận được refresh token từ cookie: {}", (refreshToken != null ? "Có dữ liệu" : "NULL"));
        return ResponseObject.success(authService.refreshToken(refreshToken));

    }

    @Put("/{id}/reset-password")
    public ResponseObject<String> resetPassword(HttpServletRequest req, HttpServletResponse res) {
        Long id = getPathId(req);
        UserRoleSecurity.authorize(id);
        return ResponseObject.success(authService.resetPassword(id, currentUser().username()));
    }

    @Post("/forgot-password")
    public ResponseObject<String> forgotPassword(HttpServletRequest req) {
        ForgotPasswordRequest forgotReq = body(req, ForgotPasswordRequest.class);
        return ResponseObject.success(authService.forgotPassword(forgotReq));
    }

    @Post("/reset-password")
    public ResponseObject<String> resetPasswordByToken(HttpServletRequest req) {
        ResetPasswordTokenRequest resetReq = body(req, ResetPasswordTokenRequest.class);
        return ResponseObject.success(authService.resetPasswordByToken(resetReq));
    }

    @Put("/change-password")
    public ResponseObject<String> changePassword(HttpServletRequest req, HttpServletResponse res) {
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
