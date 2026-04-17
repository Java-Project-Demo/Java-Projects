package org.dawn.backend.controller;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.annotation.Get;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.dto.response.AuditLogResponse;
import org.dawn.backend.service.AuditLogService;

import java.util.List;

@RequiredArgsConstructor
public class AuditLogController extends AbstractController {

    private final AuditLogService auditLogService;

    @Get("")
    public ResponseObject<List<AuditLogResponse>> getLogs(
            HttpServletRequest req) {
        checkRole("ROLE_ADMIN");

        String userId = query(req, "userId");
        String action = query(req, "action");
        String status = query(req, "status");

        int page = queryInt(req, "page", 0);
        int size = queryInt(req, "size", 20);

        List<AuditLogResponse> logs = auditLogService.searchLogs(userId, action, status, null, null, page, size);
        return ResponseObject.success(logs);
    }
}
