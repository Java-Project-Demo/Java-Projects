package org.dawn.backend;

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

        while (matcher.find()) {
            String envKey = matcher.group();

            String envValue = dotenv.get(envKey) != null ? dotenv.get(envKey) : System.getenv(envKey);

            if (envValue != value) {
                matcher.appendReplacement(sb, envValue);
            }

        }

        matcher.appendTail(sb);
        return !sb.isEmpty() ? sb.toString() : value;
    }

    public static int getInt(String key) {
        return Integer.parseInt(get(key));
    }
}