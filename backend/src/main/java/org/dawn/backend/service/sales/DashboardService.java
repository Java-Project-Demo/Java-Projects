package org.dawn.backend.service.sales;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.constant.sales.OrderStatus;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.constant.warranty.WarrantyStatus;
import org.dawn.backend.dto.catalog.ProductItemResponse;
import org.dawn.backend.dto.catalog.ProductMappingHelper;
import org.dawn.backend.dto.catalog.ProductResponse;
import org.dawn.backend.dto.inventory.WarehouseLocationResponse;
import org.dawn.backend.dto.inventory.WarehouseMappingHelper;
import org.dawn.backend.dto.sales.ImeiTraceResponse;
import org.dawn.backend.dto.sales.SummaryResponse;
import org.dawn.backend.dto.system.AuditLogMappingHelper;
import org.dawn.backend.dto.system.AuditLogResponse;
import org.dawn.backend.dto.warranty.WarrantyMappingHelper;
import org.dawn.backend.dto.warranty.WarrantyResponse;
import org.dawn.backend.entity.Customer;
import org.dawn.backend.entity.Order;
import org.dawn.backend.entity.Product;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.catalog.ProductRepository;
import org.dawn.backend.repository.sales.CustomerRepository;
import org.dawn.backend.repository.sales.OrderRepository;
import org.dawn.backend.repository.system.AuditLogRepository;
import org.dawn.backend.repository.warehouse.WarehouseLocationRepository;
import org.dawn.backend.repository.warranty.WarrantyRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RequiredArgsConstructor
@Service
public class DashboardService {
    private final ProductRepository productRepository;

    private final OrderRepository orderRepository;

    private final ProductItemRepository itemRepository;

    private final AuditLogRepository auditLogRepository;

    private final WarrantyRepository warrantyRepository;

    private final CustomerRepository customerRepository;

    private final WarehouseLocationRepository locationRepository;

    public SummaryResponse getAdminDashboard() {
        List<AuditLogResponse> recentActivities = auditLogRepository
                .findTop5OrderByCreatedAtDesc()
                .stream()
                .map(AuditLogMappingHelper::map)
                .toList();
        return SummaryResponse
                .builder()
                .totalInventoryValue(productRepository.getTotalInventoryValue())
                .totalProducts(productRepository.count())
                .lowStockCount(productRepository.countLowStock())
                .pendingOrders(orderRepository.countByStatus(OrderStatus.PENDING))
                .totalRevenue(orderRepository.getTodayRevenue())
                .totalProfit(orderRepository.getTodayGrossProfit())
                .activeWarrantyClaims(warrantyRepository.countByStatusNot(WarrantyStatus.RETURNED))
                .recentActivities(recentActivities)
                .build();
    }

    public List<ProductResponse> getLowStockAlerts() {
        return productRepository
                .findLowStockProducts()
                .stream()
                .map(ProductMappingHelper::map)
                .toList();
    }


    public ImeiTraceResponse traceImei(String imei) {

        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

        Product product = productRepository
                .findById(item.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));

        ImeiTraceResponse.SaleInfoResponse saleInfo = null;
        if (item.getOrderId() != null) {
            Order order = orderRepository
                    .findById(item.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ORDER_NOT_FOUND));
            Customer customer = customerRepository
                    .findById(order.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.CUSTOMER_NOT_FOUND));
            saleInfo = ImeiTraceResponse.SaleInfoResponse
                    .builder()
                    .customer(ImeiTraceResponse.SaleInfoResponse.CustomerInfo
                            .builder()
                            .fullName(customer.getFullName())
                            .phoneNumber(customer.getPhoneNumber())
                            .build())
                    .saleDate(order.getCreatedAt())
                    .salePrice(order.getTotalAmount())
                    .paymentMethod(order.getPaymentMethod())
                    .build();

        }

        WarehouseLocationResponse locationInfo = null;
        if (item.getLocationId() != null) {
            locationInfo = locationRepository
                    .findById(item.getLocationId())
                    .map(WarehouseMappingHelper::mapItem)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.LOCATION_NOT_FOUND));
        }

        List<WarrantyResponse> warranties = warrantyRepository
                .findByProductItemId(item.getId())
                .stream()
                .map(WarrantyMappingHelper::map)
                .toList();

        return ImeiTraceResponse.builder()
                .itemInfo(ImeiTraceResponse.ItemInfoResponse
                        .builder()
                        .imei(item.getImei())
                        .status(item.getStatus())
                        .importDate(item.getImportDate())
                        .build())
                .productInfo(ImeiTraceResponse.ProductInfoResponse.builder()
                        .sku(product.getName())
                        .name(product.getSku())
                        .warrantyPeriod(product.getWarrantyPeriod())
                        .build())
                .saleInfo(saleInfo)
                .locationInfo(locationInfo)
                .warrantyHistory(warranties)
                .build();
    }


    public List<ProductItemResponse> getAgingStockReport(int days) {
        Instant threshold = Instant.now().minus(days, ChronoUnit.DAYS);
        return itemRepository.findAgingStock(threshold)
                .stream()
                .map(ProductMappingHelper::mapItem)
                .toList();
    }
}
