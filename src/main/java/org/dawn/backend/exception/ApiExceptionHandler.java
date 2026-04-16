package org.dawn.backend.exception;

import com.cloudinary.Api;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.exception.payload.ExceptionMessage;


import java.io.IOException;
import java.time.ZonedDateTime;

@WebFilter("/*")
@Slf4j
public class ApiExceptionHandler implements Filter {


    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        try {
            chain.doFilter(req, res);
        } catch (Exception e) {
            handleApiRequestException((HttpServletResponse) res, e);
        }

    }


    public void handleApiRequestException(HttpServletResponse res, Exception e) throws IOException {
        int status = HttpServletResponse.SC_INTERNAL_SERVER_ERROR;

        String message = "Internal Server Error";
        log.info("**ApiExceptionHandler controller, handler API request*\n");
        Throwable cause = e;

        if (e instanceof ServletException && e.getCause() != null) {
            cause = e.getCause();
        }

        if (cause instanceof ApiException apiEx) {
            status = apiEx.getStatus();
            message = apiEx.getMessage();
            log.warn("API Exception handled: {} - {}", status, message);
        } else {
            log.error("Unexcepted error occurred", e);
            message = cause.getMessage();
        }

        ExceptionMessage errorBody = buildResponse(status, message);

        res.setStatus(status);
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write(mapper.writeValueAsString(errorBody));
    }

    private ExceptionMessage buildResponse(int status, String message) {
        return ExceptionMessage
                .builder()
                .timestamp(ZonedDateTime.now())
                .status(status)
                .message(message)
                .build();
    }

}