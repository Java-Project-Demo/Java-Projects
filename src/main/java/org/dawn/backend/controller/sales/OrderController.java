package org.dawn.backend.controller.sales;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.annotation.Get;
import org.dawn.backend.config.web.annotation.Post;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.config.web.response.ResponsePage;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.controller.base.AbstractController;
import org.dawn.backend.dto.sales.OrderRequest;
import org.dawn.backend.dto.sales.RefundRequest;
import org.dawn.backend.dto.sales.OrderResponse;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.service.sales.OrderService;

@RequiredArgsConstructor
public class OrderController extends AbstractController {

    private final OrderService orderService;

    @Get("/")
    public ResponseObject<ResponsePage<OrderResponse>> getAll(HttpServletRequest req, HttpServletResponse res) {

        String status = query(req, "status");
        int page = queryInt(req, "page", 0);
        int size = queryInt(req, "size", 20);
        return ResponseObject.success(orderService.getAll(status, null, null, page, size));
    }

    @Get("/{id}")
    public ResponseObject<OrderResponse> getOne(HttpServletRequest req, HttpServletResponse res) {
        Long id = getPathId(req);
        if (id == null) {
            throw new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND);
        }
        return ResponseObject.success(orderService.getOne(id));
    }

    @Post("/create")
    public ResponseObject<OrderResponse> create(HttpServletRequest req, HttpServletResponse res) {
        OrderRequest dto = body(req, OrderRequest.class);
        return ResponseObject.created(orderService.create(dto));
    }

    @Post("/cancel/{id}")
    public ResponseObject<OrderResponse> cancel(HttpServletRequest req, HttpServletResponse res) {
        Long id = getPathId(req);
        return ResponseObject.created(orderService.cancelOrder(id));
    }

    @Post("/return/{id}")
    public ResponseObject<?> refund(HttpServletRequest req, HttpServletResponse res) {
        Long orderId = getPathId(req);
        if (orderId == null) {
            throw new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND);
        }
        RefundRequest dto = body(req, RefundRequest.class);
        orderService.returnOrder(orderId, dto);
        return ResponseObject.success("Order refund success");
    }
}
