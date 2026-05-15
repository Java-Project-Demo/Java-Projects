package org.dawn.backend.exception.wrapper;

import org.dawn.backend.exception.ApiException;

import java.io.Serial;

public class InvalidRequestException extends ApiException {
    @Serial
    private static final long serialVersionUID = 1L;

    public InvalidRequestException(String message, Object... args) {
        super(400, message, args);
    }


}