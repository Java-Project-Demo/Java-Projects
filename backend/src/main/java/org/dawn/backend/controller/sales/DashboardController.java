package org.dawn.backend.controller.sales;


import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.service.sales.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/low-stock")
    public ResponseObject<?> lowStock() {
        return ResponseObject.success(dashboardService.getLowStockAlerts());
    }

    @GetMapping("/trace")
    public ResponseObject<?> trace(@RequestParam String imei) {
        return ResponseObject.success(dashboardService.traceImei(imei));
    }

    @GetMapping("/aging-report")
    public ResponseObject<List<ProductItem>> getAgingReport(@RequestParam Integer days) {
        return ResponseObject.success(dashboardService.getAgingStockReport(days));
    }

    @GetMapping("/summary")
    public ResponseObject<?> getSummary() {
        return ResponseObject.success(dashboardService.getAdminDashboard());
    }
}
