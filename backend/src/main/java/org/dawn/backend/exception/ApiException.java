package org.dawn.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final Object[] args;


    public ApiException(HttpStatus status, String message, Object... args) {
        super(message);
        this.status = status;
        this.args = args;
    }

    public ApiException(String message) {
        this(HttpStatus.BAD_REQUEST, message);
    }
}
