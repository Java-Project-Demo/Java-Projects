package org.dawn.backend.controller.inventory;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.annotation.Get;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.controller.base.AbstractController;
import org.dawn.backend.dto.sales.CustomerResponse;
import org.dawn.backend.service.sales.CustomerService;

import java.util.List;

@RequiredArgsConstructor
public class CustomerController extends AbstractController {
    private final CustomerService customerService;

    @Get("/")
    public ResponseObject<List<CustomerResponse>> getAll(HttpServletRequest req) {
        return ResponseObject.success(customerService.getAll());
    }

    @Get("/{id}")
    public ResponseObject<CustomerResponse> getById(HttpServletRequest req) {
        return ResponseObject.success(customerService.getById(getPathId(req)));
    }

    @Get("/email/{email}")
    public ResponseObject<CustomerResponse> getByEmail(HttpServletRequest req) {
        String email = getPath(req);
        return ResponseObject.success(customerService.getByEmail(email));
    }

    @Get("/phone/{phoneNumber}")
    public ResponseObject<CustomerResponse> getByPhoneNumber(HttpServletRequest req) {
        String phoneNumber = getPath(req);
        return ResponseObject.success(customerService.getByPhoneNumber(phoneNumber));
    }
}
