package org.dawn.backend.dto.catalog;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.system.ActiveStatus;
import org.dawn.backend.dto.shared.BaseResponse;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false)
public class SupplierResponse extends BaseResponse {
    private Long id;

    private String name;

    private String contactPerson;

    private String phoneNumber;

    private String email;

    private String address;

    private String taxCode;

    private ActiveStatus status;

    private Boolean isDeleted;
}
