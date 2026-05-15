package org.dawn.backend.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.exception.payload.ExceptionMessage;
import org.dawn.backend.utils.L10nUtils;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
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
        log.info("**ApiExceptionHandler controller, handler API request*\n");
        Throwable cause = e;
        while (cause.getCause() != null && !(cause instanceof ApiException)) {
            if (cause instanceof InvocationTargetException || cause instanceof ServletException || cause instanceof RuntimeException) {
                cause = cause.getCause();
            } else {
                break;
            }
        }
        int status;
        String message;

        if (cause instanceof ApiException apiEx) {
            status = apiEx.getStatus();
            message = L10nUtils.translate(apiEx.getMessage(), apiEx.getArgs());
            log.warn("API Exception handled: {} - {}", status, message);
        } else {
            log.error("Unexcepted error occurred", e);
            status = HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
            message = L10nUtils.translate(cause.getMessage());
        }

        ExceptionMessage errorBody = buildResponse(status, message);

        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.setCharacterEncoding("UTF-8");
        res.getWriter().write(mapper.writeValueAsString(errorBody));
        res.getWriter().flush();
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