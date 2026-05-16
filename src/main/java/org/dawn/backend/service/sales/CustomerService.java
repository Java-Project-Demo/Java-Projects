package org.dawn.backend.service.sales;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.sales.CustomerResponse;
import org.dawn.backend.entity.Customer;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.sales.CustomerRepository;

import java.util.Optional;

@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerResponse lookup(String phone, String email) {
        Optional<Customer> found = Optional.empty();
        if (phone != null && !phone.isBlank()) {
            found = customerRepository.findByPhoneNumber(phone.trim());
        }
        if (found.isEmpty() && email != null && !email.isBlank()) {
            found = customerRepository.findByEmail(email.trim());
        }
        Customer c = found.orElseThrow(() -> new ResourceNotFoundException(Message.Exception.CUSTOMER_NOT_FOUND));
        return CustomerResponse.builder()
                .id(c.getId())
                .phoneNumber(c.getPhoneNumber())
                .fullName(c.getFullName())
                .email(c.getEmail())
                .address(c.getAddress())
                .build();
    }
}
