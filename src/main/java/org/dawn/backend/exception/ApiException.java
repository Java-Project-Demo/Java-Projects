package org.dawn.backend.exception;

import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {
    private final int status;

    public ApiException(String message) {
        super(message);
        this.status = 400;
    }

    public ApiException(int status, String message) {
        super(message);
        this.status = status;
    }
}
