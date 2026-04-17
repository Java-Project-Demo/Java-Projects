package org.dawn.backend.config.security.handler;


import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.sys.AppConfig;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.service.RefreshTokenService;
import org.dawn.backend.utils.JWTUtils;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@Slf4j
public class SecurityHandler {

    private final ObjectMapper objectMapper;
    private final JWTUtils jwtUtils;
    private final String jwtRefreshCookie = AppConfig.get("app.jwtRefreshCookieName");

    public void handle(HttpServletResponse res, int status, String message) throws IOException {

        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");

        Map<String, Object> body = new HashMap<>();
        body.put("status", status);
        body.put("error", (status == 401) ? "Unauthorized" : "Forbidden");
        body.put("message", message);

        res.getWriter().write(objectMapper.writeValueAsString(body));
    }

    public void handleLogout(HttpServletRequest req, HttpServletResponse res, RefreshTokenService service) {
        UserPrincipal user = SecurityContext.get();
        if (user != null) service.deleteByUserId(user.id());

        Cookie cookie = jwtUtils.getCleanJwtRefreshCookie();
        res.addCookie(cookie);
        res.setStatus(204);
    }
}
