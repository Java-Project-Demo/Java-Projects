package org.dawn.backend.controller;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.Post;
import org.dawn.backend.config.Put;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.dto.request.OrderRequest;
import org.dawn.backend.service.OrderService;

@RequiredArgsConstructor
public class OrderController extends AbstractController {

    private final OrderService orderService;

    @Post("/create")
    public ResponseObject<?> create(HttpServletRequest req) {
        OrderRequest dto = body(req, OrderRequest.class);
        return ResponseObject.created(orderService.create(dto));
    }

    @Put("/cancel/{id}")
    public ResponseObject<?> cancel(HttpServletRequest req) {
        Long id = getPathId(req);
        return ResponseObject.created(orderService.cancelOrder(id));
    }
}
