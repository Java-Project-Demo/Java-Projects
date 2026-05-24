package org.dawn.backend.utils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.dawn.backend.config.web.Loggable;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.entity.UserDetailsImpl;
import org.dawn.backend.service.system.AuditLogService;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLogAspect {

    private final AuditLogService auditLogService;
    private final ExpressionParser spelParser = new SpelExpressionParser();

    @Around("@annotation(loggable)")
    public Object logExecution(ProceedingJoinPoint joinPoint, Loggable loggable) throws Throwable {
        UserDetailsImpl auth = SecurityContext.getCurrentUser();

        Long currentUserId = (auth != null) ? auth.getId() : null;
        String currentUsername = (auth != null) ? auth.getUsername() : "SYSTEM";
        Object result;
        String entityId = null;
        try {
            result = joinPoint.proceed();
            String message = resolveMessage(loggable.message(), joinPoint, result);
            entityId = resolveMessage(loggable.entityId(), joinPoint, result);
            auditLogService.saveLogAsync(loggable, entityId, currentUserId, currentUsername, LogConstant.Status.SUCCESS, message);
            return result;
        } catch (Throwable e) {
            auditLogService.saveLogAsync(loggable, entityId, currentUserId, currentUsername, LogConstant.Status.FAILED, "Error " + e.getMessage());
            throw e;
        }
    }

    private String resolveMessage(String expression, ProceedingJoinPoint joinPoint, Object result) {
        if (expression == null || expression.isBlank()) return "";

        try {
            EvaluationContext context = new StandardEvaluationContext();

            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            String[] paramNames = signature.getParameterNames();
            Object[] args = joinPoint.getArgs();
            for (int i = 0; i < paramNames.length; i++) {
                context.setVariable(paramNames[i], args[i]);
            }

            context.setVariable("result", result);
            return spelParser.parseExpression(expression).getValue(context, String.class);
        } catch (Exception e) {
            log.warn("SpEL eval failed for expression '{}': {}", expression, e.getMessage());
            return "";
        }
    }
}
