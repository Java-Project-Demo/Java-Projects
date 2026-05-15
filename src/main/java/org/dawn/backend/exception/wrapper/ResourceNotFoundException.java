package org.dawn.backend.exception.wrapper;

import org.dawn.backend.exception.ApiException;

import java.io.Serial;

public class ResourceNotFoundException extends ApiException {
    @Serial
    private static final long serialVersionUID = 1L;

    public ResourceNotFoundException(String message, Object... args) {
        super(404, message, args);
    }
}