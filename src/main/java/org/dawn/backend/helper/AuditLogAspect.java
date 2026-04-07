package org.dawn.backend.helper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.dawn.backend.config.Loggable;
import org.dawn.backend.entity.AuditLog;
import org.dawn.backend.repository.AuditLogRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLogAspect {

    private final AuditLogRepository auditLogRepository;

    @AfterReturning(pointcut = "@annotation(loggable)", returning = "result")
    public void logExecution(JoinPoint joinPoint, Loggable loggable, Object result) {
        try {
            AuditLog auditLog = new AuditLog();

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = (auth != null) ? auth.getName() : "";
            auditLog.setUserId(currentUsername);

            auditLog.setAction(loggable.action());

            String details = String.format("Method: %s | Args: %s",
                    joinPoint.getSignature().toShortString(),
                    Arrays.toString(joinPoint.getArgs()));
            auditLog.setDetails(details);

            auditLogRepository.save(auditLog);

        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }
}
