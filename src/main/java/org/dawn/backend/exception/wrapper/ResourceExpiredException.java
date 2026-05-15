package org.dawn.backend.exception.wrapper;

import org.dawn.backend.exception.ApiException;

import java.io.Serial;

public class ResourceExpiredException extends ApiException {

    @Serial
    private static final long serialVersionUID = 1L;

    public ResourceExpiredException(String message, Object... args) {
        super(410, message, args);
    }

}
