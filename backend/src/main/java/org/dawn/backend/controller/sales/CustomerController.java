package org.dawn.backend.controller.sales;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.dto.sales.CustomerResponse;
import org.dawn.backend.service.sales.CustomerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

    @GetMapping("")
    public ResponseObject<List<CustomerResponse>> getAll() {
        return ResponseObject.success(customerService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseObject<CustomerResponse> getById(@PathVariable Long id) {
        return ResponseObject.success(customerService.getById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseObject<CustomerResponse> getByEmail(@PathVariable String email) {
        return ResponseObject.success(customerService.getByEmail(email));
    }

    @GetMapping("/phone/{phoneNumber}")
    public ResponseObject<CustomerResponse> getByPhoneNumber(@PathVariable String phoneNumber) {
        return ResponseObject.success(customerService.getByPhoneNumber(phoneNumber));
    }

    @GetMapping("/lookup")
    public ResponseObject<CustomerResponse> lookup(
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email) {
        return ResponseObject.success(customerService.lookup(phone, email));
    }
}
