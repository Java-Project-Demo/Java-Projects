package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.constant.system.ActiveStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Supplier extends AbstractMappedEntity {
    private Long id;

    private String name;

    private String contactPerson;

    private String phoneNumber;

    private String email;

    private String address;

    private String taxCode;

    private ActiveStatus status;

    @Builder.Default
    private Boolean isDeleted = false;
}
