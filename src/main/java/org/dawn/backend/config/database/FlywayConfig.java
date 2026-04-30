package org.dawn.backend.config.database;

import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.sys.AppConfig;
import org.flywaydb.core.Flyway;

@Slf4j
public class FlywayConfig {

    public static void migrate() {
        log.info("Starting Flyway Migration...");
        Flyway flyway = Flyway
                .configure()
                .dataSource(DatabaseConfig.getDataSource())
                .locations(AppConfig.get("flyway.locations"))
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .load();

        try {
            flyway.migrate();

        } catch (Exception e) {
            log.warn("Flyway migration failed, attempting repair...", e);
            flyway.repair();
        }
        log.info("Flyway Migration completed successfully");
    }
}
