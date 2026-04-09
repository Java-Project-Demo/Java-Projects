package org.dawn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class AuditLogResponse extends BaseResponse {
    private Long id;

    private String userId;

    private String action;

    private String entityName;

    private String entityId;

    private String status;

    private String details;
}
