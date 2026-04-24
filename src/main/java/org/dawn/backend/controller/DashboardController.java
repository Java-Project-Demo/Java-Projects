package org.dawn.backend.controller;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.annotation.Get;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.service.DashboardService;

@RequiredArgsConstructor
public class DashboardController extends AbstractController {


    private final DashboardService dashboardService;

    @Get("/low-stock")
    public ResponseObject<?> lowStock(HttpServletRequest req) {
        return ResponseObject.success(dashboardService.getLowStockAlerts());
    }


    @Get("/trace-imei")

    public ResponseObject<?> trace(HttpServletRequest req) {
        String imei = req.getParameter("imei");
        return ResponseObject.success(dashboardService.traceImei(imei));
    }

    @Get("/summary")
    public ResponseObject<?> getSummary(HttpServletRequest req) {
        return ResponseObject.success(dashboardService.getAdminDashboard());
    }
}
