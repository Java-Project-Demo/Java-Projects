package org.dawn.backend.exception.wrapper;

import org.dawn.backend.exception.ApiException;

import java.io.Serial;

public class ResourceAlreadyExistedException extends ApiException {

    @Serial
    private static final long serialVersionUID = 1L;

    public ResourceAlreadyExistedException(String message, Object... args) {
        super(409, message, args);
    }
}