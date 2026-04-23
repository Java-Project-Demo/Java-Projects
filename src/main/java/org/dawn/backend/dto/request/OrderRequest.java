package org.dawn.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.PaymentMethod;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class OrderRequest {
    private String customerName;

    private String customerPhone;

    private String customerEmail;

    private String customerAddress;

    private PaymentMethod paymentMethod;

    private List<CartItemRequest> items;
}
