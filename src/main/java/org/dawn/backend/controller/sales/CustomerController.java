package org.dawn.backend.controller.sales;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.annotation.Get;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.controller.base.AbstractController;
import org.dawn.backend.dto.sales.CustomerResponse;
import org.dawn.backend.service.sales.CustomerService;

@RequiredArgsConstructor
public class CustomerController extends AbstractController {

    private final CustomerService customerService;

    @Get("/lookup")
    public ResponseObject<CustomerResponse> lookup(HttpServletRequest req, HttpServletResponse res) {
        String phone = req.getParameter("phone");
        String email = req.getParameter("email");
        return ResponseObject.success(customerService.lookup(phone, email));
    }
}
