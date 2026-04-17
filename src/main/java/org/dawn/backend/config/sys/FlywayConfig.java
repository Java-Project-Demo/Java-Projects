package org.dawn.backend.config.sys;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;

@Slf4j
public class FlywayConfig {

    public static void migrate() {
        log.info("Starting Flyway Migration...");
        Flyway flyway = Flyway
                .configure()
                .dataSource(DatabaseConfig.getDataSource())
                .locations(AppConfig.get("flyway.locations"))
                .baselineOnMigrate(true).load();

        flyway.migrate();

        log.info("Flyway Migration completed successfully");
    }
}
