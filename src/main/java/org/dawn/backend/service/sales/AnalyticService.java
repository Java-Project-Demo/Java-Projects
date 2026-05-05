package org.dawn.backend.service.sales;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.dto.catalog.ProductResponse;
import org.dawn.backend.entity.ProductItem;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Slf4j
public class AnalyticService {
    private final DashboardService dashboardService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Tool("Lấy số liệu tổng quan hệ thống cho Admin (Doanh thu, lợi nhuận, tổng tồn kho, hoạt động gần đây)")
    public String getAdminDashboard() {
        try {
            Map<String, Object> data = dashboardService.getAdminDashboard();
            return "Dữ liệu Dashboard Admin: " + objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return "Lỗi khi lấy dữ liệu: " + e.getMessage();
        }
    }


    @Tool("Lấy danh sách các sản phẩm sắp hết hàng (dưới ngưỡng tối thiểu)")
    public String getLowStockAlert() {
        try {
            List<ProductResponse> alerts = dashboardService.getLowStockAlerts();
            if (alerts.isEmpty()) return "Hiện tại không có sản phẩm nào dưới ngưỡng cảnh báo.";
            return "Danh sách sản phẩm sắp hết hàng: " + objectMapper.writeValueAsString(alerts);
        } catch (Exception e) {
            return "Lỗi khi lấy dữ liệu: " + e.getMessage();
        }
    }

    @Tool("Truy xuất vòng đời của một thiết bị qua mã IMEI (Thông tin máy, khách mua, ngày bán, lịch sử bảo hành)")
    public String traceImei(@P("imei") String imei) {
        try {
            Map<String, Object> history = dashboardService.traceImei(imei);
            return "Lịch sử thiết bị IMEI " + imei + ": " + objectMapper.writeValueAsString(history);
        } catch (Exception e) {
            return "Lỗi khi lấy dữ liệu: " + e.getMessage();
        }
    }

    @Tool("Báo cáo hàng tồn kho lâu ngày (Aging Stock). DaysThreshold là số ngày hàng nằm trong kho chưa xuất (mặc định thường là 30, 60, 90 ngày)")
    public String getAgingStockReport(@P("daysThreshold") int daysThreshold) {
        try {
            List<ProductItem> agingItems = dashboardService.getAgingStockReport(daysThreshold);
            if (agingItems.isEmpty()) return "Không có hàng tồn lâu hơn " + daysThreshold + " ngày.";
            return "Danh sách hàng tồn lâu ngày (" + daysThreshold + " ngày+): " + objectMapper.writeValueAsString(agingItems);
        } catch (Exception e) {
            return "Lỗi khi lấy dữ liệu: " + e.getMessage();
        }
    }
}
