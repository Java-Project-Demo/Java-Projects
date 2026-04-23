package org.dawn.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CartItemRequest {
    private Long productId;

    private Integer quantity;

    private List<String> selectImeis;
}
