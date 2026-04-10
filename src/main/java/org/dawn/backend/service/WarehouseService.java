package org.dawn.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.Loggable;
import org.dawn.backend.constant.ItemStatus;
import org.dawn.backend.constant.MovementType;
import org.dawn.backend.constant.ProductStatus;
import org.dawn.backend.dto.request.ProductRequest;
import org.dawn.backend.entity.Product;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.entity.StockMovement;
import org.dawn.backend.entity.User;
import org.dawn.backend.helper.ProductMappingHelper;
import org.dawn.backend.repository.ProductItemRepository;
import org.dawn.backend.repository.ProductRepository;
import org.dawn.backend.repository.StockMovementRepository;
import org.dawn.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final ProductRepository productRepository;

    private final ProductItemRepository itemRepository;

    private final StockMovementRepository movementRepository;

    private final UserRepository userRepository;

    @Transactional
    @Loggable(action = "CREATE_PRODUCT", entity = "PRODUCT")
    public Product create(ProductRequest product) {
        return productRepository.save(ProductMappingHelper.map(product));
    }


    @Transactional
    @Loggable(action = "UPDATE_PRODUCT", entity = "PRODUCT")
    public Product updateProduct(Product product) {
        Product existing = productRepository.findById(product.getId()).orElseThrow();
        existing.setName(product.getName());
        return productRepository.save(existing);
    }

    @Transactional
    @Loggable(action = "IMPORT_STOCK", entity = "WAREHOUSE")
    public Product importImeis(Long productId, List<String> imeiList) {
        Product product = productRepository.findById(productId).orElseThrow();

        for (String imei : imeiList) {
            if (itemRepository.existsByImei(imei)) throw new RuntimeException("ITEM " + imei + " already exists");

            itemRepository.save(ProductItem
                    .builder()
                    .productId(productId)
                    .imei(imei)
                    .status(ItemStatus.AVAILABLE)
                    .build());
        }


        productRepository.addStock(productId, imeiList.size());
        Long currentId = getCurrentUserId();
        saveMovement(productId, MovementType.IMPORT, "NEW_IMPORT", imeiList.size(), null, currentId, "Import IMEI");
        return product;
    }

    @Transactional
    @Loggable(action = "EXPORT_STOCK", entity = "WAREHOUSE")
    public ProductItem exportByImei(Long orderId, String imei) {
        ProductItem item = itemRepository.findByImei(imei).orElseThrow();

        if (item.getStatus() != ItemStatus.AVAILABLE) {
            throw new RuntimeException();
        }


        item.setStatus(ItemStatus.SOLD);
        item.setOrderId(orderId);
        item.setSoldDate(Instant.now());
        ProductItem savedItem = itemRepository.save(item);

        productRepository.subtractStock(item.getProductId(), 1);
        Long currentId = getCurrentUserId();
        saveMovement(item.getProductId(), MovementType.EXPORT, "SALE_EXPORT", 1, orderId, currentId, "Export IMEI");

        return savedItem;
    }


    @Transactional
    @Loggable(action = "ADJUST_STOCK", entity = "WAREHOUSE")
    public ProductItem markAsDamaged(String imei, String reason) {
        ProductItem item = itemRepository.findByImei(imei).orElseThrow();
        item.setStatus(ItemStatus.DAMAGED);

        productRepository.subtractStock(item.getProductId(), 1);
        Long currentId = getCurrentUserId();
        saveMovement(item.getProductId(), MovementType.ADJUST, "DAMAGE_ADJUST", 1, null, currentId, reason);
        return itemRepository.save(item);
    }


    private void saveMovement(Long pId, MovementType type, String action, Integer qty, Long ref, Long uId, String note) {
        movementRepository.save(StockMovement
                .builder()
                .productId(pId)
                .type(type)
                .actionType(action)
                .quantity(qty)
                .referenceId(ref)
                .createdBy(uId)
                .note(note)
                .build());
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return userRepository
                    .findByUsername(auth.getName())
                    .map(User::getId)
                    .orElse(null);
        }
        return null;
    }
}
