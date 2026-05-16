package org.dawn.backend.config.database;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.AppConfig;

@Slf4j
public class DatabaseConfig {
    private static HikariDataSource dataSource;

    public static HikariDataSource getDataSource() {
        if (dataSource == null) {
            log.info("Initializing HikariCP Connection Pool...");
            HikariConfig config = new HikariConfig();

            config.setJdbcUrl(AppConfig.get("db.url"));
            config.setUsername(AppConfig.get("db.user"));
            config.setPassword(AppConfig.get("db.pass"));

            // Config Oracle
            config.setDriverClassName(AppConfig.get("db.driver"));
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setIdleTimeout(30000);
            config.setConnectionTimeout(30000);
            config.setValidationTimeout(5000);
            config.setInitializationFailTimeout(120_000);
            config.setConnectionTestQuery("SELECT 1 FROM DUAL");

            dataSource = new HikariDataSource(config);
            log.info("Hikari initialized successfully");
        }

        return dataSource;
    }

    public static void close() {
        if (dataSource != null) {
            dataSource.close();
            log.info("Database Connection Pool closed.");
        }
    }
}
