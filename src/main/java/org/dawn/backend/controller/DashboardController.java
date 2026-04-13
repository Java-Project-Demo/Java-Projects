package org.dawn.backend.controller;


import lombok.RequiredArgsConstructor;
import org.dawn.backend.service.DashboardService;
import org.dawn.backend.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class DashboardController {

    private final ReportService reportService;

    private final DashboardService dashboardService;

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> lowStock() {
        return ResponseEntity.ok(reportService.getLowStockAlerts());
    }


    @GetMapping("/trace-imei")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> trace(@RequestParam String imei) {
        return ResponseEntity.ok(reportService.traceImei(imei));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSummary() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }
}
