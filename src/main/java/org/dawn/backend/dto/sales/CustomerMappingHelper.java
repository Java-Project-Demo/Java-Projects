package org.dawn.backend.dto.sales;

import org.dawn.backend.entity.Customer;

public interface CustomerMappingHelper {
    static CustomerResponse map(Customer req) {
        return CustomerResponse.builder()
                .phoneNumber(req.getPhoneNumber())
                .fullName(req.getFullName())
                .email(req.getEmail())
                .address(req.getAddress())
                .build();
    }

    ;
}
