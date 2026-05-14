package org.dawn.backend.service.system;

import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.AppConfig;
import org.dawn.backend.config.web.MailConfig;
import org.dawn.backend.config.web.TemplateConfig;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.HashMap;
import java.util.Map;

@Slf4j
public class MailService {
    private static MailService instance;
    private final TemplateEngine template = TemplateConfig.getEngine();
    private final Session session = MailConfig.getSession();

    private static final String mailUsername = AppConfig.get("mail.username");
    private static final String mailFrom = AppConfig.get("mail.from");
    private static final boolean enabled = Boolean.parseBoolean(AppConfig.get("mail.enabled"));

    static {

        if (!enabled) {
            log.info("Mail Service is running in DEV mode (Email is not send)");
        }
    }

    private MailService() {
    }

    public void sendHtmlMail(String to, String subject, String templateName, Map<String, Object> variables) {
        log.info("Check enable config: {}", AppConfig.get("mail.enabled"));
        log.info("Check enable : {}", enabled);
        if (!enabled) {
            log.info("[DEV] pass out sending mail. Send to: {} | Title: {} | Data: {}", to, subject, variables);
            return;
        }
        Context context = new Context();
        context.setVariables(variables);
        String htmlContent = template.process(templateName, context);
        Thread.ofVirtual().start(() -> {
            try {
                Message message = new MimeMessage(session);
                String senderEmail = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : mailUsername;
                message.setFrom(new InternetAddress(senderEmail, "System"));
                message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
                message.setSubject(subject);
                message.setContent(htmlContent, "text/html; charset=utf-8");

                Transport.send(message);
                log.info("Email sent successfully to: {}", to);
            } catch (Exception e) {
                log.error("Failed to send email to: {}", to, e);
            }
        });
    }

    public void sendPasswordResetMail(String to, String recipientName, String resetLink) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", recipientName);
        variables.put("resetLink", resetLink);

        sendHtmlMail(to, "Đặt lại mật khẩu", "password-reset", variables);
    }

    public static synchronized MailService getInstance() {
        if (instance == null) instance = new MailService();
        return instance;
    }

}
