package org.dawn.backend.config.web;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
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

        if (origin != null) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        }

        res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
        res.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Max-Age", "3600");

        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return true;
        }
        return false;
    }
}
