package org.dawn.backend.config.sys;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
public class AppConfig {
    private static final Properties props = new Properties();
    private static final Dotenv dotenv;
    private static final Pattern ENV_PATTERN = Pattern.compile("\\$\\{([^}]+)\\}");

    static {

        dotenv = Dotenv.configure().ignoreIfMissing().load();
        try (InputStream is = AppConfig.class
                .getClassLoader()
                .getResourceAsStream("application.properties")) {
            if (is != null) {
                props.load(is);
                log.info("Loaded application.properties successfully");
            } else {
                log.error("Could not find application.properties!");
            }
        } catch (IOException e) {
            log.error("Error loading configuration: {}", e.getMessage());
        }
    }

    public static String get(String key) {
        String value = props.getProperty(key);
        if (value == null) return null;

        Matcher matcher = ENV_PATTERN.matcher(value);
        StringBuilder sb = new StringBuilder();
        boolean found = false;
        while (matcher.find()) {
            found = true;
            String envKey = matcher.group(1);

            String envValue = dotenv.get(envKey);
            if (envValue == null) {
                envValue = System.getenv(envKey);
            }
            if (envValue != null) {
                matcher.appendReplacement(sb, Matcher.quoteReplacement(envValue));
            } else {
                log.error("Environment variable not found: {}", envKey);
                matcher.appendReplacement(sb, Matcher.quoteReplacement(matcher.group()));
            }
        }
        if (!found) return value;

        matcher.appendTail(sb);
        return sb.toString();
    }

    public static int getInt(String key) {
        return Integer.parseInt(get(key));
    }
}