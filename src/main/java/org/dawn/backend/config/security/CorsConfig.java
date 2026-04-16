package org.dawn.backend.config.security;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;
import java.util.List;

public class CorsConfig {
    public final List<String> ALLOWED_DOMAINS = Arrays.asList(
            "http://localhost:3000",
            "http://localhost:4200",
            "http://localhost:5173");


    private final String ALLOWED_HEADERS =
            "Authorization, Cache-Control, Content-Type, X-Requested-With, Accept, Origin";


    private final String ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";

    public boolean process(HttpServletRequest req, HttpServletResponse res) {

        String origin = req.getHeader("Origin");

        if (origin != null && ALLOWED_DOMAINS.contains(origin)) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        }

        res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
        res.setHeader("Access-Control-Request-Headers", ALLOWED_HEADERS);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Max-Age", "3600");

        return "OPTIONS".equalsIgnoreCase(req.getMethod());
    }
}
