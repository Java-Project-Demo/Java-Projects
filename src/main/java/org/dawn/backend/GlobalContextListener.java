package org.dawn.backend;

import com.zaxxer.hikari.HikariDataSource;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.utils.JWTUtils;
import org.flywaydb.core.Flyway;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@WebListener
@Slf4j
public class GlobalContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {

        log.info("Backend Application is starting up...");
        try {
            // Database & Migration
            DatabaseConfig.getDataSource();
            FlywayConfig.migrate();

            // Repository JDBC


            // Thread Pool
            ExecutorService executorService = Executors.newFixedThreadPool(10);

            // Service


            // Servlet Context
            ServletContext ctx = sce.getServletContext();
            ctx.setAttribute("jwtUtils", new JWTUtils());
        } catch (Exception e) {
            log.error("Error during startup: {}", e.getMessage(), e);
            throw new RuntimeException("Application failed to start", e);
        }

    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        DatabaseConfig.close();
        log.info("Application closed");
    }
}