package org.dawn.backend.config.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PageResponse<T> {
    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int size;
    private int number;
}
