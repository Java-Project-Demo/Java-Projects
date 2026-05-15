package org.dawn.backend.utils;

import lombok.extern.slf4j.Slf4j;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.ResourceBundle;

@Slf4j
public class L10nUtils {

    private static final String BASE_NAME = "message.messages";

    public static String translate(String key, Object... args) {
        try {
            Locale locale = new Locale("vi");
            ResourceBundle bundle = ResourceBundle.getBundle(BASE_NAME, locale);
            String pattern = bundle.getString(key);

            if (args != null && args.length > 0) {
                return MessageFormat.format(pattern, args);
            }
            return pattern;
        } catch (Exception e) {
            log.error("L10N ERROR: Can't find bundle or key. Key: " + key);
            return key;
        }
    }
}
