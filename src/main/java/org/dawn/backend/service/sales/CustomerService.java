package org.dawn.backend.service.sales;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.sales.CustomerMappingHelper;
import org.dawn.backend.dto.sales.CustomerResponse;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.sales.CustomerRepository;

import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class CustomerService {
    private final CustomerRepository customerRepository;


    public List<CustomerResponse> getAll() {
        return customerRepository
                .findAll()
                .stream()
                .map(CustomerMappingHelper::map)
                .toList();
    }

    public CustomerResponse getById(Long id) {
        return customerRepository
                .findById(id)
                .map(CustomerMappingHelper::map)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.CUSTOMER_NOT_FOUND));
    }

    public CustomerResponse getByEmail(String email) {
        return customerRepository
                .findByEmail(email)
                .map(CustomerMappingHelper::map)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.CUSTOMER_NOT_FOUND));
    }

    public CustomerResponse getByPhoneNumber(String phoneNumber) {
        return customerRepository
                .findByPhoneNumber(phoneNumber)
                .map(CustomerMappingHelper::map)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.CUSTOMER_NOT_FOUND));
    }
}
