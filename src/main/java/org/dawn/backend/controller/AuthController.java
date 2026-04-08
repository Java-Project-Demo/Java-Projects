package org.dawn.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.dto.request.ChangePasswordRequest;
import org.dawn.backend.dto.request.LoginRequest;
import org.dawn.backend.dto.response.JwtResponse;
import org.dawn.backend.dto.response.TokenRefreshResponse;
import org.dawn.backend.entity.UserDetailsImpl;
import org.dawn.backend.service.AuthService;
import org.dawn.backend.service.UserService;
import org.dawn.backend.utils.JWTUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Operations related to auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    private final JWTUtils jwtUtils;

    private final UserService userService;

    @PostMapping("/login")
    public ResponseObject<JwtResponse> login(@RequestBody LoginRequest user) {
        JwtResponse jwt = authService.login(user);
        return new ResponseObject<>(
                HttpStatus.OK,
                "Success",
                jwt,
                new HttpHeaders() {
                    {
                        add(
                                HttpHeaders.SET_COOKIE,
                                jwtUtils.generateJwtRefreshCookie(jwt.getRefreshToken())
                                        .toString());
                    }
                });
    }


    @PostMapping("/refresh-token")
    public ResponseObject<TokenRefreshResponse> refreshToken(@CookieValue("${app.jwtRefreshCookieName}") String refreshToken) {
        TokenRefreshResponse token = authService.refreshToken(refreshToken);
        return new ResponseObject<>(
                HttpStatus.OK,
                "Success",
                token,
                new HttpHeaders() {{
                    add(
                            HttpHeaders.SET_COOKIE,
                            jwtUtils.generateJwtRefreshCookie(token.getRefreshToken())
                                    .toString());
                }});

    }

    @PutMapping("/{id}/reset-password")
    @PreAuthorize("@roleSecurity.canUpdate(#id, authentication)")
    public ResponseObject<String> resetPassword(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl admin) {
        return ResponseObject.success(authService.resetPassword(id, admin.getUsername()));
    }

    @PutMapping("/change-password")
    public ResponseObject<String> changePassword(@RequestBody ChangePasswordRequest req, @AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "You need to login");
        }

        String message = authService.changePassword(currentUser.getUsername(), req);

        return ResponseObject.success(message);
    }
}
