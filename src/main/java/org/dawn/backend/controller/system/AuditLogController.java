package org.dawn.backend.controller.system;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.annotation.Get;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.controller.base.AbstractController;
import org.dawn.backend.dto.system.AuditLogResponse;
import org.dawn.backend.service.system.AuditLogService;

import java.util.List;

@RequiredArgsConstructor
public class AuditLogController extends AbstractController {

    private final AuditLogService auditLogService;

    @Get("/")
    public ResponseObject<List<AuditLogResponse>> getLogs(
            HttpServletRequest req, HttpServletResponse res) {
        checkRole("ADMIN", "STOCK");

        String userId = query(req, "userId");
        String action = query(req, "action");
        String status = query(req, "status");

        int page = queryInt(req, "page", 0);
        int size = queryInt(req, "size", 20);

        List<AuditLogResponse> logs = auditLogService.searchLogs(userId, action, status, null, null, page, size);
        return ResponseObject.success(logs);
    }
}
