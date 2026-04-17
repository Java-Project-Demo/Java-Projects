package org.dawn.backend.config.security;

public class SecurityContext {

    private static final ThreadLocal<UserPrincipal> context = new ThreadLocal<>();

    public static void set(UserPrincipal user) {
        context.set(user);
    }

    public static UserPrincipal get() {
        return context.get();
    }

    public static void clear() {
        context.remove();
    }
}
