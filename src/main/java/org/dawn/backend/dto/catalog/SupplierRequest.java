package org.dawn.backend.dto.catalog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.system.ActiveStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SupplierRequest {
    private String name;

    private String contactPerson;

    private String phoneNumber;

    private String email;

    private String address;

    private String taxCode;
}
