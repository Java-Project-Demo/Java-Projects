package org.dawn.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.Loggable;
import org.dawn.backend.config.response.ResponsePage;
import org.dawn.backend.constant.ItemStatus;
import org.dawn.backend.constant.Message;
import org.dawn.backend.constant.MovementType;
import org.dawn.backend.dto.request.ProductRequest;
import org.dawn.backend.dto.response.ProductResponse;
import org.dawn.backend.entity.Product;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.entity.StockMovement;
import org.dawn.backend.exception.wrapper.ResourceAlreadyExistedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.helper.ProductMappingHelper;
import org.dawn.backend.helper.UserHelper;
import org.dawn.backend.repository.ProductItemRepository;
import org.dawn.backend.repository.ProductRepository;
import org.dawn.backend.repository.StockMovementRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final ProductRepository productRepository;

    private final ProductItemRepository itemRepository;

    private final StockMovementRepository movementRepository;

    private final UserHelper userHelper;

    @Loggable(action = "GET_ALL_PRODUCT", entity = "PRODUCT")
    public ResponsePage<ProductResponse> getAll(Pageable pageable) {
        return ResponsePage.of(productRepository
                .findAll(pageable)
                .map(ProductMappingHelper::map));
    }

    public ProductResponse getOne(Long id) {
        return productRepository
                .findById(id)
                .map(ProductMappingHelper::map)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));
    }


    @Transactional
    @Loggable(action = "CREATE_PRODUCT", entity = "PRODUCT")
    public ProductResponse create(ProductRequest req) {
        Product product = productRepository.save(ProductMappingHelper.map(req));
        return ProductMappingHelper.map(product);
    }


    @Transactional
    @Loggable(action = "UPDATE_PRODUCT", entity = "PRODUCT")
    public ProductResponse updateProduct(Long id, ProductRequest product) {
        Product existing = productRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));
        existing.setName(product.getName());
        return ProductMappingHelper.map(existing);
    }

    @Transactional
    @Loggable(action = "IMPORT_STOCK", entity = "WAREHOUSE")
    public Product importImeis(Long productId, List<String> imeiList) {
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_NOT_FOUND));

        for (String imei : imeiList) {
            if (itemRepository.existsByImei(imei))
                throw new ResourceAlreadyExistedException("ITEM " + imei + " already exists");

            itemRepository.save(ProductItem
                    .builder()
                    .productId(productId)
                    .imei(imei)
                    .status(ItemStatus.AVAILABLE)
                    .build());
        }


        productRepository.addStock(productId, imeiList.size());
        Long currentId = userHelper.getCurrentUserId();
        saveMovement(
                productId,
                MovementType.IMPORT,
                "NEW_IMPORT",
                imeiList.size(),
                null,
                currentId,
                "Import IMEI"
        );
        return product;
    }

    @Transactional
    @Loggable(action = "EXPORT_STOCK", entity = "WAREHOUSE")
    public ProductItem exportByImei(Long orderId, String imei) {
        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

        if (item.getStatus() != ItemStatus.AVAILABLE) {
            throw new RuntimeException("Status conflict");
        }


        item.setStatus(ItemStatus.SOLD);
        item.setOrderId(orderId);
        item.setSoldDate(Instant.now());
        ProductItem savedItem = itemRepository.save(item);

        productRepository.subtractStock(item.getProductId(), 1);
        Long currentId = userHelper.getCurrentUserId();
        saveMovement(
                item.getProductId(),
                MovementType.EXPORT,
                "SALE_EXPORT",
                1,
                orderId,
                currentId,
                "Export IMEI"
        );

        return savedItem;
    }


    @Transactional
    @Loggable(action = "ADJUST_STOCK", entity = "WAREHOUSE")
    public ProductItem markAsDamaged(String imei, String reason) {
        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));
        item.setStatus(ItemStatus.DAMAGED);

        productRepository.subtractStock(item.getProductId(), 1);
        Long currentId = userHelper.getCurrentUserId();
        saveMovement(
                item.getProductId(),
                MovementType.ADJUST,
                "DAMAGE_ADJUST",
                1,
                null,
                currentId,
                reason
        );
        return itemRepository.save(item);
    }

    @Transactional
    @Loggable(action = "RETURN_PRODUCT", entity = "WAREHOUSE")
    public ProductItem returnProduct(String imei, String reason) {
        ProductItem item = itemRepository
                .findByImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.PRODUCT_ITEM_NOT_FOUND));

        if (item.getStatus() != ItemStatus.SOLD) {
            throw new RuntimeException();
        }

        item.setStatus(ItemStatus.AVAILABLE);
        item.setSoldDate(null);
        item.setOrderId(null);

        productRepository.addStock(item.getProductId(), 1);


        saveMovement(
                item.getProductId(),
                MovementType.IMPORT,
                "RETURN_IMPORT",
                1,
                null,
                userHelper.getCurrentUserId(),
                "Client return :" + reason
        );

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
}
