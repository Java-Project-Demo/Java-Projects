package org.dawn.backend.config.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.security.handler.AuthEntryPointJwt;
import org.dawn.backend.config.security.handler.RoleAccessHandler;
import org.dawn.backend.service.UserDetailService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.*;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;

@Configuration
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    private final AuthEntryPointJwt unauthorizedHandler;

    private final RoleAccessHandler roleAccessHandler;

    private final CorsConfig corsConfig;

    private final LogoutHandler logoutHandler;

    private final AuthTokenFilter authTokenFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @ConditionalOnBean(UserDetailService.class)
    public AuthenticationManager authenticationManager(
            HttpSecurity http,
            PasswordEncoder passwordEncoder,
            UserDetailService userDetailService) throws Exception {
        var authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder
                .userDetailsService(userDetailService)
                .passwordEncoder(passwordEncoder);
        return authBuilder.build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfig.config()))
                .csrf(CsrfConfigurer::disable)
                .exceptionHandling(this::configExceptionHandling)
                .sessionManagement(this::configSession)
                .authorizeHttpRequests(this::configAuth)
                .logout(this::configLogout);

        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    private void configExceptionHandling(ExceptionHandlingConfigurer<HttpSecurity> config) {
        config
                .authenticationEntryPoint(unauthorizedHandler)
                .accessDeniedHandler(roleAccessHandler);
    }

    private void configSession(SessionManagementConfigurer<HttpSecurity> config) {
        config
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    }

    private void configAuth(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry config) {
        config
                .requestMatchers("/api/v1/auth/**")
                .permitAll()
                .requestMatchers("/api/v1/user/**")
                .permitAll()
                .anyRequest()
                .authenticated();
    }

    private void configLogout(LogoutConfigurer<HttpSecurity> config) {
        config
                .logoutUrl("/api/v1/auth/logout")
                .addLogoutHandler(logoutHandler)
                .logoutSuccessHandler(
                        (req, res, auth) ->
                                res.setStatus(HttpServletResponse.SC_NO_CONTENT));
    }
}
