package org.dawn.backend.dto.system;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.dawn.backend.dto.shared.BaseResponse;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class AuditLogResponse extends BaseResponse {
    private Long id;

    private Long userId;

    private String action;

    private String entityName;

    private String entityId;

    private String status;

    private String details;

    private String staffName;

    private String staffUsername;
}
