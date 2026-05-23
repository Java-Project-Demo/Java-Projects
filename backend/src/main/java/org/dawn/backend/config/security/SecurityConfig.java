package org.dawn.backend.config.security;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.CorsConfig;
import org.dawn.backend.service.auth.RefreshTokenService;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import java.io.IOException;

@WebFilter("/*")
@Slf4j
public class SecurityConfig implements Filter {

    private CorsConfig corsConfig;
    private SecurityHandler securityHandler;
    private AuthTokenFilter authTokenFilter;
    private RefreshTokenService refreshTokenService;

    private static final String[] SWAGGER_URL = {
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/webjars/**",
            "/swagger-resources/**",
            "/api/v1/v3/api-docs/**",
            "/api/v1/v3/api-docs",
            "/api/v1/api-docs/**",
            "/api/v1/api-docs"
    };

    private static final String[] PUBLIC_URL = {
            "/api/v1/auth/**",
            "/api/v1/user/**",
            "/api/v1/cloudinary/upload"
    };

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        ApplicationContext ctx = WebApplicationContextUtils.getRequiredWebApplicationContext(filterConfig.getServletContext());
        this.corsConfig = ctx.getBean(CorsConfig.class);
        this.securityHandler = ctx.getBean(SecurityHandler.class);
        this.authTokenFilter = ctx.getBean(AuthTokenFilter.class);
        this.refreshTokenService = ctx.getBean(RefreshTokenService.class);
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
        for (String url : SWAGGER_URL) {
            String regex = "^" + url
                    .replace("/**", "/.*")
                    .replace("/*", "/[^/]*") + "$";
            if (path.matches(regex)) return true;
        }
        return false;
    }
}
