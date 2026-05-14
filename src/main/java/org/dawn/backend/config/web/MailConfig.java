package org.dawn.backend.config.web;


import jakarta.mail.Authenticator;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;

import java.util.Properties;

public class MailConfig {
    private static final String mailHost = AppConfig.get("mail.host");
    private static final String mailPort = AppConfig.get("mail.port");
    private static final String mailUsername = AppConfig.get("mail.username");
    private static final String mailPassword = AppConfig.get("mail.password");

    public static Session getSession() {
        Properties props = new Properties();
        props.put("mail.smtp.host", mailHost);
        props.put("mail.smtp.port", mailPort);
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");

        return Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(mailUsername, mailPassword);
            }
        });
    }

}
