package org.dawn.backend.dto.sales;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.dto.system.AuditLogResponse;

import java.math.BigDecimal;
import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryResponse {
    private BigDecimal totalInventoryValue;
    private Long totalProducts;
    private Long lowStockCount;
    private Long pendingOrders;
    private BigDecimal totalRevenue;
    private BigDecimal totalProfit;
    private Long activeWarrantyClaims;
    private List<AuditLogResponse> recentActivities;
}
