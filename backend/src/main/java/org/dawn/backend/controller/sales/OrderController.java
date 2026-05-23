package org.dawn.backend.controller.sales;


import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.config.web.response.ResponsePage;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.sales.OrderRequest;
import org.dawn.backend.dto.sales.OrderResponse;
import org.dawn.backend.dto.sales.RefundRequest;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.service.sales.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("")
    public ResponseObject<ResponsePage<OrderResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return ResponseObject.success(orderService.getAll(status, null, null, page, size));
    }

    @GetMapping("/{id}")
    public ResponseObject<OrderResponse> getOne(@PathVariable Long id) {
        if (id == null) {
            throw new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND);
        }
        return ResponseObject.success(orderService.getOne(id));
    }

    @PostMapping("/create")
    public ResponseObject<OrderResponse> create(@RequestBody OrderRequest dto) {
        return ResponseObject.created(orderService.create(dto));
    }

    @PostMapping("/cancel/{id}")
    public ResponseObject<OrderResponse> cancel(@PathVariable Long id) {
        return ResponseObject.created(orderService.cancelOrder(id));
    }

    @PostMapping("/return/{id}")
    public ResponseObject<?> refund(@PathVariable Long id, @RequestBody RefundRequest dto) {
        orderService.returnOrder(id, dto);
        return ResponseObject.success("Order refund success");
    }
}
