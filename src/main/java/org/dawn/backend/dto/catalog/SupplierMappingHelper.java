package org.dawn.backend.dto.catalog;

import org.dawn.backend.entity.Supplier;

public interface SupplierMappingHelper {
    static Supplier map(SupplierRequest req) {
        return Supplier.builder()
                .name(req.getName())
                .contactPerson(req.getContactPerson())
                .phoneNumber(req.getPhoneNumber())
                .email(req.getEmail())
                .address(req.getAddress())
                .taxCode(req.getTaxCode())
                .build();
    }

    static Supplier map(SupplierUpdateRequest req) {
        return Supplier.builder()
                .name(req.getName())
                .contactPerson(req.getContactPerson())
                .phoneNumber(req.getPhoneNumber())
                .email(req.getEmail())
                .address(req.getAddress())
                .taxCode(req.getTaxCode())
                .status(req.getStatus())
                .isDeleted(req.getIsDeleted())
                .build();
    }

    static SupplierResponse map(Supplier req) {
        return SupplierResponse.builder()
                .id(req.getId())
                .name(req.getName())
                .contactPerson(req.getContactPerson())
                .phoneNumber(req.getPhoneNumber())
                .email(req.getEmail())
                .address(req.getAddress())
                .taxCode(req.getTaxCode())
                .status(req.getStatus())
                .isDeleted(req.getIsDeleted())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }
}
