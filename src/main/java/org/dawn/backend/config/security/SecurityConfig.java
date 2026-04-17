package org.dawn.backend.config.security;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
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
            "/api/v1/user/**",
            "/api/v1/cloudinary/upload"
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
        if (corsConfig.process(req, res)) return;
        //   Setup Context
        UserPrincipal principal = authTokenFilter.authenticated(req);

        try {

            if (principal != null) {
                SecurityContext.set(principal);
            }
            boolean isPublicPath = isPublic(path);
            boolean isLogoutRequest = path.endsWith("/logout") && "POST".equalsIgnoreCase(req.getMethod());

            if (isLogoutRequest) {
                securityHandler.handleLogout(req, res, refreshTokenService);
                return;
            } else if (isPublicPath || principal != null) {
                // Bypass public URL
                chain.doFilter(request, response);
            } else {
                securityHandler.handle(res, 401, "Unauthorized");
            }
        } finally {
            SecurityContext.clear();
        }
    }

    private boolean isPublic(String path) {
        for (String url : PUBLIC_URL) {
            String regex = "^" + url
                    .replace("/**", "/.*")
                    .replace("/*", "/[^/]*") + "$";
            if (path.matches(regex)) return true;
        }
        return false;
    }
}
