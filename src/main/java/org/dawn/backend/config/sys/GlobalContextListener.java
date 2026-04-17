package org.dawn.backend.config.sys;

import com.cloudinary.Cloudinary;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.cloudinary.CloudinaryConfig;
import org.dawn.backend.config.security.AuthTokenFilter;
import org.dawn.backend.config.security.CorsConfig;
import org.dawn.backend.config.security.handler.SecurityHandler;
import org.dawn.backend.config.security.hashing.PasswordEncoder;
import org.dawn.backend.config.setup.DataInitializer;
import org.dawn.backend.controller.*;
import org.dawn.backend.repository.*;
import org.dawn.backend.repository.Impl.*;
import org.dawn.backend.repository.ProductItemRepository;
import org.dawn.backend.service.*;
import org.dawn.backend.config.security.hashing.BCryptPasswordEncoderImpl;
import org.dawn.backend.utils.JWTUtils;

import javax.sql.DataSource;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@WebListener
@Slf4j
public class GlobalContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {

        log.info("Backend Application is starting up...");
        try {
            Cloudinary cloudinary = CloudinaryConfig.getConfig();

            // Database & Migration
            DataSource datasource = DatabaseConfig.getDataSource();
            FlywayConfig.migrate();

            // Repository JDBC
            AuditLogRepository auditLogRepository = new AuditLogRepositoryImpl(datasource);
            OrderItemRepository orderItemRepository = new OrderItemRepositoryImpl(datasource);
            OrderRepository orderRepository = new OrderRepositoryImpl(datasource);
            ProductItemRepository productItemRepository = new ProductItemRepositoryImpl(datasource);
            ProductRepository productRepository = new ProductRepositoryImpl(datasource);
            StockMovementRepository stockMovementRepository = new StockMovementRepositoryImpl(datasource);
            UserRepository userRepository = new UserRepositoryImpl(datasource);
            RoleRepository roleRepository = new RoleRepositoryImpl(datasource);
            RefreshTokenRepository refreshTokenRepository = new RefreshTokenRepositoryImpl(datasource);

            // Thread Pool
            ExecutorService executorService = Executors.newFixedThreadPool(10);

            // Utils
            ObjectMapper objectMapper = new ObjectMapper();
            JWTUtils jwtUtils = new JWTUtils();

            // Security
            SecurityHandler securityHandler = new SecurityHandler(objectMapper, jwtUtils);
            AuthTokenFilter authTokenFilter = new AuthTokenFilter(jwtUtils);
            CorsConfig corsConfig = new CorsConfig();

            // Service
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoderImpl();
            CloudinaryService cloudinaryService = new CloudinaryService(cloudinary);
            AuditLogService auditLogService = new AuditLogService(auditLogRepository);
            RefreshTokenService refreshTokenService = new RefreshTokenService(refreshTokenRepository, userRepository);
            AuthService authService = new AuthService(userRepository, passwordEncoder, jwtUtils, refreshTokenService);
            DashboardService dashboardService = new DashboardService(productRepository, orderRepository);
            ReportService reportService = new ReportService(productRepository, productItemRepository, stockMovementRepository);
            UserService userService = new UserService(userRepository, roleRepository, passwordEncoder, datasource);
            WarehouseService warehouseService = new WarehouseService(productRepository, productItemRepository, stockMovementRepository, orderRepository, orderItemRepository);
            OrderService orderService = new OrderService(orderRepository, orderItemRepository, productRepository, productItemRepository, warehouseService);

            // Controller
            UserController userController = new UserController(userService);
            AuditLogController auditLogController = new AuditLogController(auditLogService);
            DashboardController dashboardController = new DashboardController(reportService, dashboardService);
            OrderController orderController = new OrderController(orderService);
            WarehouseController warehouseController = new WarehouseController(warehouseService);
            AuthController authController = new AuthController(authService);
            CloudinaryController cloudinaryController = new CloudinaryController(cloudinaryService);

            // Initializer
            DataInitializer initializer = new DataInitializer(userRepository, roleRepository, passwordEncoder);
            initializer.run();

            // Servlet Context
            ServletContext ctx = sce.getServletContext();
            ctx.setAttribute("corsConfig", corsConfig);
            ctx.setAttribute("securityHandler", securityHandler);
            ctx.setAttribute("authTokenFilter", authTokenFilter);
            ctx.setAttribute("refreshTokenService", refreshTokenService);
            ctx.setAttribute("jwtUtils", jwtUtils);
            // Controller Context
            ctx.setAttribute("userController", userController);
            ctx.setAttribute("auditLogController", auditLogController);
            ctx.setAttribute("dashboardController", dashboardController);
            ctx.setAttribute("orderController", orderController);
            ctx.setAttribute("warehouseController", warehouseController);
            ctx.setAttribute("authController", authController);
            ctx.setAttribute("cloudinaryController", cloudinaryController);
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