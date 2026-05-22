package org.dawn.backend.exception.wrapper;

import org.dawn.backend.exception.ApiException;
import org.springframework.http.HttpStatus;

import java.io.Serial;

public class AuthorizedDeniedException extends ApiException {
    @Serial
    private static final long serialVersionUID = 1L;

    public AuthorizedDeniedException(String message, Object... args) {
        super(HttpStatus.UNAUTHORIZED, message, args);
    }

}
