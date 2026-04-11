package org.dawn.backend.service;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.entity.Product;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.entity.StockMovement;
import org.dawn.backend.repository.ProductItemRepository;
import org.dawn.backend.repository.ProductRepository;
import org.dawn.backend.repository.StockMovementRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminReportService {
    private final ProductRepository productRepository;

    private final ProductItemRepository itemRepository;

    private final StockMovementRepository movementRepository;


    public List<Product> getLowStockAlerts() {
        return productRepository
                .findAll()
                .stream()
                .filter(p -> p.getCurrentStock() <= p.getMinThreshold())
                .toList();
    }


    public Map<String, Object> traceImei(String imei) {
        ProductItem item = itemRepository.findByImei(imei).orElseThrow();

        Product product = productRepository.findById(item.getProductId()).orElse(null);

        List<StockMovement> movements = movementRepository.findByProductId(item.getProductId());

        Map<String, Object> result = new HashMap<>();
        result.put("itemInfo", item);
        result.put("productInfo", product);
        result.put("history", movements);

        return result;
    }
}
