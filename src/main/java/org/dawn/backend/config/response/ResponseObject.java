package org.dawn.backend.config.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseObject<T> {

    @JsonIgnore
    private int code;

    private String message;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private T data;


    @Builder.Default
    private String timeStamp = ZonedDateTime.now().toString();


    public static <T> ResponseObject<T> success(T data) {
        return ResponseObject.<T>builder().code(200).message("Success").data(data).build();
    }

    public static <T> ResponseObject<T> success(T data, String message) {
        return ResponseObject.<T>builder().code(200).message(message).data(data).build();
    }

    public static <T> ResponseObject<T> created(T data) {
        return ResponseObject.<T>builder().code(201).message("Created Successfully").data(data).build();
    }

    public static <T> ResponseObject<T> error(int code, String message) {
        return ResponseObject.<T>builder().code(code).message(message).build();
    }
}
