package org.dawn.backend.controller;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.annotation.Post;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.constant.Message;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.dto.request.OrderRequest;
import org.dawn.backend.dto.request.RefundRequest;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.service.OrderService;

@RequiredArgsConstructor
public class OrderController extends AbstractController {

    private final OrderService orderService;

    @Post("/create")
    public ResponseObject<?> create(HttpServletRequest req) {
        OrderRequest dto = body(req, OrderRequest.class);
        return ResponseObject.created(orderService.create(dto));
    }

    @Post("/cancel/{id}")
    public ResponseObject<?> cancel(HttpServletRequest req) {
        Long id = getPathId(req);
        return ResponseObject.created(orderService.cancelOrder(id));
    }

    @Post("/return/{id}")
    public ResponseObject<?> refund(HttpServletRequest req) {
        Long orderId = getPathId(req);
        if (orderId == null) {
            throw new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND);
        }
        RefundRequest dto = body(req, RefundRequest.class);
        orderService.returnOrder(orderId, dto);
        return ResponseObject.success("Order refund success");
    }
}
