package org.dawn.backend.entity;

import lombok.*;
import lombok.experimental.SuperBuilder;


@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = "user")
@ToString(callSuper = true, exclude = "user")
public class AuditLog extends AbstractMappedEntity {
    private Long id;

    private Long userId;

    private String action;

    private String entityName;

    private String entityId;

    private String status;

    private String details;

    private String staffName;

    private String staffUsername;

    private User user;
}
