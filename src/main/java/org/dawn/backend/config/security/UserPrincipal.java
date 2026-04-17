package org.dawn.backend.config.security;

public record UserPrincipal(Long id, String username, String role) {
}
