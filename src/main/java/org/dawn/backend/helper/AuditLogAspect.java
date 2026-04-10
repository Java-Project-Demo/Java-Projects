package org.dawn.backend.helper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.dawn.backend.config.Loggable;
import org.dawn.backend.entity.AuditLog;
import org.dawn.backend.entity.ProductItem;
import org.dawn.backend.repository.AuditLogRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLogAspect {

    private final AuditLogRepository auditLogRepository;

    private final ObjectMapper objectMapper;


    @Around("@annotation(loggable)")
    public Object logExecution(ProceedingJoinPoint joinPoint, Loggable loggable) throws Throwable {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = (auth != null && auth.isAuthenticated()) ? auth.getName() : "ANONYMOUS";

        Object result;
        try {

            result = joinPoint.proceed();


            saveLogAsync(joinPoint, loggable, result, currentUsername, "SUCCESS", null);
            return result;
        } catch (Throwable e) {
            saveLogAsync(joinPoint, loggable, null, currentUsername, "FAILED", e.getMessage());
            throw e;
        }
    }

    @Async
    protected void saveLogAsync(JoinPoint joinPoint, Loggable loggable, Object result, String username, String status, String errorMessage) {
        try {
            AuditLog auditLog = AuditLog
                    .builder()
                    .userId(username)
                    .action(loggable.action())
                    .entityName(loggable.entity())
                    .status(status)
                    .build();

            Map<String, Object> detailsMap = new HashMap<>();
            detailsMap.put("method", joinPoint.getSignature().toShortString());
            detailsMap.put("params", filterSensitiveArgs(joinPoint.getArgs()));

            if (errorMessage != null) {
                detailsMap.put("error", errorMessage);
            }

            auditLog.setDetails(objectMapper.writeValueAsString(detailsMap));

            if (result != null) {
                auditLog.setEntityId(extractId(result));
            }

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Error record Audit Log", e);
        }
    }


    private Object filterSensitiveArgs(Object[] args) {
        try {
            String json = objectMapper.writeValueAsString(args);
            JsonNode root = objectMapper.readTree(json);
            makeSensitiveFields(root);
            return root;
        } catch (Exception e) {
            return "Data can not serialize";
        }
    }

    private void makeSensitiveFields(JsonNode node) {
        if (node.isObject()) {
            ObjectNode obj = (ObjectNode) node;
            List<String> sensitiveFields = Arrays.asList("password", "oldPassword", "newPassword", "token");
            sensitiveFields.forEach(field -> {
                if (obj.has(field)) obj.put(field, "*********");
            });
        }
        node.forEach(this::makeSensitiveFields);
    }

    private String extractId(Object result) {
        if (result == null) return null;
        try {

            if (result instanceof ProductItem) {
                return ((ProductItem) result).getImei();
            }

            for (Field field : result.getClass().getDeclaredFields()) {
                if (field.getName().equalsIgnoreCase("id") || field.getName().equalsIgnoreCase("sku")) {
                    field.setAccessible(true);
                    Object val = field.get(result);
                    return val != null ? val.toString() : null;
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
