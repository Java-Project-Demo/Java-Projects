package org.dawn.backend.controller;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.annotation.Get;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.service.DashboardService;
import org.dawn.backend.service.ReportService;

@RequiredArgsConstructor
public class DashboardController {

    private final ReportService reportService;

    private final DashboardService dashboardService;

    @Get("/low-stock")
    public ResponseObject<?> lowStock(HttpServletRequest req) {
        return ResponseObject.success(reportService.getLowStockAlerts());
    }


    @Get("/trace-imei")

    public ResponseObject<?> trace(HttpServletRequest req) {
        String imei = req.getParameter("imei");
        return ResponseObject.success(reportService.traceImei(imei));
    }

    @Get("/summary")
    public ResponseObject<?> getSummary(HttpServletRequest req) {
        return ResponseObject.success(dashboardService.getAdminDashboard());
    }
}
