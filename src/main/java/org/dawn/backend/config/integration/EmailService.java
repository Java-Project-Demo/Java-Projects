package org.dawn.backend.config.integration;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.AppConfig;

import java.util.Properties;

@Slf4j
public class EmailService {

    private final String host;
    private final int port;
    private final String username;
    private final String password;
    private final String from;
    private final boolean enabled;

    public EmailService() {
        this.host = AppConfig.get("mail.host");
        String portStr = AppConfig.get("mail.port");
        int parsedPort = 587;
        try {
            if (portStr != null && portStr.matches("\\d+")) parsedPort = Integer.parseInt(portStr);
        } catch (NumberFormatException ignored) {
        }
        this.port = parsedPort;
        this.username = AppConfig.get("mail.username");
        this.password = AppConfig.get("mail.password");
        this.from = AppConfig.get("mail.from");
        String enabledStr = AppConfig.get("mail.enabled");
        boolean configValid = host != null && !host.startsWith("$")
                && username != null && !username.startsWith("$")
                && password != null && !password.startsWith("$");
        this.enabled = "true".equalsIgnoreCase(enabledStr) && configValid;
        if (!this.enabled) log.info("EmailService running in DEV mode — reset links will be logged, not sent");
    }

    public void sendPasswordResetEmail(String to, String recipientName, String resetLink) {
        if (!enabled) {
            log.info("[DEV] Password reset link for {}: {}", to, resetLink);
            return;
        }

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", String.valueOf(port));
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject("Đặt lại mật khẩu - UTC System");
            message.setContent(buildEmailBody(recipientName, resetLink), "text/html; charset=utf-8");
            Transport.send(message);
            log.info("Password reset email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
            throw new RuntimeException(org.dawn.backend.constant.system.Message.Exception.EMAIL_SENDING_FAILED);
        }
    }

    private String buildEmailBody(String name, String resetLink) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                  <h2 style="color: #E8603C;">UTC System — Đặt lại mật khẩu</h2>
                  <p>Xin chào <strong>%s</strong>,</p>
                  <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                  <p>Nhấn vào nút bên dưới để đặt lại mật khẩu. Link có hiệu lực trong <strong>15 phút</strong>.</p>
                  <p style="text-align: center; margin: 32px 0;">
                    <a href="%s"
                       style="background-color: #E8603C; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 4px; font-size: 16px;">
                      Đặt lại mật khẩu
                    </a>
                  </p>
                  <p>Hoặc copy link này vào trình duyệt:<br><a href="%s">%s</a></p>
                  <hr style="margin: 24px 0;">
                  <p style="color: #888; font-size: 12px;">
                    Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                    Tài khoản của bạn vẫn an toàn.
                  </p>
                </div>
                """.formatted(name, resetLink, resetLink, resetLink);
    }
}
