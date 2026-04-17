package org.dawn.backend.config.annotation;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@FunctionalInterface
public interface ApiHandler {
    void handle(HttpServletRequest req, HttpServletResponse res) throws Exception;
}
