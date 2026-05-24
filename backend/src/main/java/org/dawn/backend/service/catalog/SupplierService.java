package org.dawn.backend.service.catalog;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.Loggable;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.catalog.SupplierMappingHelper;
import org.dawn.backend.dto.catalog.SupplierRequest;
import org.dawn.backend.dto.catalog.SupplierResponse;
import org.dawn.backend.dto.catalog.SupplierUpdateRequest;
import org.dawn.backend.entity.Supplier;
import org.dawn.backend.exception.wrapper.ResourceAlreadyExistedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.catalog.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class SupplierService {
    private final SupplierRepository supplierRepository;

    public List<SupplierResponse> getAll() {
        return supplierRepository
                .findAll()
                .stream()
                .map(SupplierMappingHelper::map)
                .toList();
    }

    public SupplierResponse getOne(Long id) {
        return supplierRepository
                .findById(id)
                .map(SupplierMappingHelper::map)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.SUPPLIER_NOT_FOUND));
    }

    @Loggable(
            action = LogConstant.Action.UPDATE_SUPPLIER,
            entity = LogConstant.Entity.SUPPLIER,
            entityId = "#result?.id",
            message = "'Admin create supplier'"
    )
    @Transactional
    public SupplierResponse create(SupplierRequest req) {
        supplierRepository
                .findByName(req.getName())
                .ifPresent(s -> {
                    throw new ResourceAlreadyExistedException(Message.Exception.SUPPLIER_EXISTED);
                });

        Supplier supplier = supplierRepository.save(SupplierMappingHelper.map(req));
        return SupplierMappingHelper.map(supplier);
    }

    @Loggable(
            action = LogConstant.Action.UPDATE_SUPPLIER,
            entity = LogConstant.Entity.SUPPLIER,
            entityId = "#result?.id",
            message = "'Admin update supplier'"
    )
    @Transactional
    public SupplierResponse update(Long id, SupplierUpdateRequest req) {
        Supplier existing = supplierRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.SUPPLIER_NOT_FOUND));
        if (req.getName() != null) existing.setName(req.getName());
        if (req.getContactPerson() != null) existing.setContactPerson(req.getContactPerson());
        if (req.getPhoneNumber() != null) existing.setPhoneNumber(req.getPhoneNumber());
        if (req.getEmail() != null) existing.setEmail(req.getEmail());
        if (req.getAddress() != null) existing.setAddress(req.getAddress());
        if (req.getTaxCode() != null) existing.setTaxCode(req.getTaxCode());
        if (req.getStatus() != null) existing.setStatus(req.getStatus());
        if (req.getIsDeleted() != null) existing.setIsDeleted(req.getIsDeleted());
        supplierRepository.save(existing);
        return SupplierMappingHelper.map(existing);
    }
}
