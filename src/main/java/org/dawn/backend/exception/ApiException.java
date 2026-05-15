package org.dawn.backend.exception;

import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {
    private final int status;
    private final Object[] args;


    public ApiException(int status, String message, Object... args) {
        super(message);
        this.status = status;
        this.args = args;
    }

    public ApiException(String message) {
        this(400, message);
    }
}
