package org.dawn.backend.dto.sales;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CustomerResponse {
    private String phoneNumber;

    private String fullName;

    private String email;

    private String address;
}
