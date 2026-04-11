package org.dawn.backend.controller;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.dto.request.OrderRequest;
import org.dawn.backend.service.AdminReportService;
import org.dawn.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class MainController {
    private final OrderService orderService;

    private final AdminReportService adminReportService;


    @PostMapping("/sales/orders")
    @PreAuthorize("hasRole('SALE')")
    public ResponseEntity<?> create(@RequestBody OrderRequest req) {
        return ResponseEntity.ok(orderService.create(req));
    }

    @GetMapping("/admin/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> lowStock() {
        return ResponseEntity.ok(adminReportService.getLowStockAlerts());
    }


    @GetMapping("/admin/trace-imei")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> trace(@RequestParam String imei) {
        return ResponseEntity.ok(adminReportService.traceImei(imei));
    }
}
