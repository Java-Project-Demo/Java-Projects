package org.dawn.backend.config.security;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.UserPrincipal;
import org.dawn.backend.config.security.handler.SecurityHandler;
import org.dawn.backend.service.RefreshTokenService;

import java.io.IOException;

@WebFilter("/*")

@Slf4j
public class SecurityConfig implements Filter {


    private CorsConfig corsConfig;
    private SecurityHandler securityHandler;
    private AuthTokenFilter authTokenFilter;
    private RefreshTokenService refreshTokenService;

    private static final String[] PUBLIC_URL = {
            "/api/v1/auth/**",
            "/api/v1/user/**"
    };

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        ServletContext ctx = filterConfig.getServletContext();
        this.corsConfig = (CorsConfig) ctx.getAttribute("corsConfig");
        this.securityHandler = (SecurityHandler) ctx.getAttribute("securityHandler");
        this.authTokenFilter = (AuthTokenFilter) ctx.getAttribute("authTokenFilter");
        this.refreshTokenService = (RefreshTokenService) ctx.getAttribute("refreshTokenService");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        String path = req.getRequestURI();

        // CORS
        if (corsConfig.process(req, res)) {
            res.setStatus(200);
            return;
        }

        // Bypass public URL
        if (isPublic(path)) {
            chain.doFilter(request, response);
            return;
        }

        //  Authentication
        UserPrincipal principal = authTokenFilter.authenticated(req);
        if (principal == null) {
            securityHandler.handle(res, 401, "Unauthorized");
            return;
        }

        //   Setup Context
        try {
            if (path.endsWith("/logout") && "POST".equalsIgnoreCase(req.getMethod())) {
                securityHandler.handleLogout(req, res, refreshTokenService);
            } else {
                //  Go to controller
                chain.doFilter(request, response);
            }
        } finally {
            SecurityContext.clear();
        }
    }

    private boolean isPublic(String path) {
        for (String url : PUBLIC_URL) {
            if (path.contains(url)) return true;
        }
        return false;
    }
}
