package org.dawn.backend.config.web;

import com.cloudinary.Cloudinary;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.DatabaseConfig;
import org.dawn.backend.config.database.FlywayConfig;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.config.integration.CloudinaryConfig;
import org.dawn.backend.config.integration.LangChainConfig;
import org.dawn.backend.config.security.AuthTokenFilter;
import org.dawn.backend.config.security.SecurityHandler;
import org.dawn.backend.config.security.hashing.BCryptPasswordEncoderImpl;
import org.dawn.backend.config.security.hashing.PasswordEncoder;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.controller.auth.AuthController;
import org.dawn.backend.controller.auth.UserController;
import org.dawn.backend.controller.catalog.CategoryController;
import org.dawn.backend.controller.catalog.ProductController;
import org.dawn.backend.controller.catalog.SupplierController;
import org.dawn.backend.controller.inventory.CustomerController;
import org.dawn.backend.controller.inventory.InventoryController;
import org.dawn.backend.controller.inventory.StockController;
import org.dawn.backend.controller.inventory.WarehouseController;
import org.dawn.backend.controller.sales.DashboardController;
import org.dawn.backend.controller.sales.OrderController;
import org.dawn.backend.controller.system.AiAgentController;
import org.dawn.backend.controller.system.AuditLogController;
import org.dawn.backend.controller.system.CloudinaryController;
import org.dawn.backend.controller.warranty.WarrantyController;
import org.dawn.backend.repository.auth.Impl.PasswordResetTokenRepositoryImpl;
import org.dawn.backend.repository.auth.Impl.RefreshTokenRepositoryImpl;
import org.dawn.backend.repository.auth.Impl.RoleRepositoryImpl;
import org.dawn.backend.repository.auth.Impl.UserRepositoryImpl;
import org.dawn.backend.repository.auth.PasswordResetTokenRepository;
import org.dawn.backend.repository.auth.RefreshTokenRepository;
import org.dawn.backend.repository.auth.RoleRepository;
import org.dawn.backend.repository.auth.UserRepository;
import org.dawn.backend.repository.catalog.CategoryRepository;
import org.dawn.backend.repository.catalog.Impl.CategoryRepositoryImpl;
import org.dawn.backend.repository.catalog.Impl.ProductItemRepositoryImpl;
import org.dawn.backend.repository.catalog.Impl.ProductRepositoryImpl;
import org.dawn.backend.repository.catalog.Impl.SupplierRepositoryImpl;
import org.dawn.backend.repository.catalog.ProductItemRepository;
import org.dawn.backend.repository.catalog.ProductRepository;
import org.dawn.backend.repository.catalog.SupplierRepository;
import org.dawn.backend.repository.sales.CustomerRepository;
import org.dawn.backend.repository.sales.Impl.CustomerRepositoryImpl;
import org.dawn.backend.repository.sales.Impl.OrderItemRepositoryImpl;
import org.dawn.backend.repository.sales.Impl.OrderRepositoryImpl;
import org.dawn.backend.repository.sales.OrderItemRepository;
import org.dawn.backend.repository.sales.OrderRepository;
import org.dawn.backend.repository.system.AuditLogRepository;
import org.dawn.backend.repository.system.Impl.AuditLogRepositoryImpl;
import org.dawn.backend.repository.warehouse.Impl.*;
import org.dawn.backend.repository.warehouse.*;
import org.dawn.backend.repository.warranty.Impl.WarrantyRepositoryImpl;
import org.dawn.backend.repository.warranty.WarrantyRepository;
import org.dawn.backend.service.auth.AuthService;
import org.dawn.backend.service.auth.RefreshTokenService;
import org.dawn.backend.service.auth.UserService;
import org.dawn.backend.service.catalog.CategoryService;
import org.dawn.backend.service.catalog.ProductService;
import org.dawn.backend.service.catalog.SupplierService;
import org.dawn.backend.service.inventory.InventoryService;
import org.dawn.backend.service.inventory.StockService;
import org.dawn.backend.service.inventory.WarehouseService;
import org.dawn.backend.service.sales.CustomerService;
import org.dawn.backend.service.sales.DashboardService;
import org.dawn.backend.service.sales.OrderService;
import org.dawn.backend.service.system.AiAgentService;
import org.dawn.backend.service.system.AuditLogService;
import org.dawn.backend.service.system.CloudinaryService;
import org.dawn.backend.service.system.MailService;
import org.dawn.backend.service.warranty.WarrantyService;
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
            TransactionManager transactionManager = new TransactionManager(datasource);
            // Repository JDBC
            AuditLogRepository auditLogRepository = new AuditLogRepositoryImpl(datasource);
            OrderItemRepository orderItemRepository = new OrderItemRepositoryImpl(datasource);
            OrderRepository orderRepository = new OrderRepositoryImpl(datasource);
            ProductItemRepository productItemRepository = new ProductItemRepositoryImpl(datasource);
            ProductRepository productRepository = new ProductRepositoryImpl(datasource);
            StockMovementRepository stockMovementRepository = new StockMovementRepositoryImpl(datasource);
            UserRepository userRepository = new UserRepositoryImpl(datasource);
            RoleRepository roleRepository = new RoleRepositoryImpl(datasource);
            InventoryDetailRepository inventoryDetailRepository = new InventoryDetailRepositoryImpl(datasource);
            InventorySessionRepository inventorySessionRepository = new InventorySessionRepositoryImpl(datasource);
            WarehouseRepository warehouseRepository = new WarehouseRepositoryImpl(datasource);
            WarehouseLocationRepository warehouseLocationRepository = new WarehouseLocationRepositoryImpl(datasource);
            RefreshTokenRepository refreshTokenRepository = new RefreshTokenRepositoryImpl(datasource);
            PasswordResetTokenRepository passwordResetTokenRepository = new PasswordResetTokenRepositoryImpl(datasource);
            WarrantyRepository warrantyRepository = new WarrantyRepositoryImpl(datasource);
            CustomerRepository customerRepository = new CustomerRepositoryImpl(datasource);
            CategoryRepository categoryRepository = new CategoryRepositoryImpl(datasource);
            SupplierRepository supplierRepository = new SupplierRepositoryImpl(datasource);
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
            MailService mailService = MailService.getInstance();
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoderImpl();
            CloudinaryService cloudinaryService = new CloudinaryService(cloudinary);
            AuditLogService auditLogService = new AuditLogService(auditLogRepository, transactionManager);
            SupplierService supplierService = new SupplierService(auditLogService, supplierRepository, transactionManager);
            RefreshTokenService refreshTokenService = new RefreshTokenService(refreshTokenRepository, userRepository, transactionManager);
            DashboardService dashboardService = new DashboardService(productRepository, orderRepository, productItemRepository, auditLogRepository, warrantyRepository, customerRepository, warehouseLocationRepository);
            UserService userService = new UserService(userRepository, roleRepository, passwordEncoder, auditLogService, transactionManager);
            AuthService authService = new AuthService(userRepository, passwordEncoder, jwtUtils, refreshTokenService, auditLogService, transactionManager, passwordResetTokenRepository, mailService);
            ProductService productService = new ProductService(auditLogService, productRepository, transactionManager);
            StockService stockService = new StockService(productRepository, productItemRepository, stockMovementRepository, orderRepository, orderItemRepository, auditLogService, transactionManager, warehouseLocationRepository, supplierRepository);
            InventoryService inventoryService = new InventoryService(inventorySessionRepository, inventoryDetailRepository, productItemRepository, warehouseRepository, warehouseLocationRepository, userRepository, transactionManager);
            WarehouseService warehouseService = new WarehouseService(warehouseRepository, warehouseLocationRepository, stockService, auditLogService, productItemRepository, transactionManager);
            OrderService orderService = new OrderService(orderRepository, orderItemRepository, productRepository, productItemRepository, customerRepository, stockService, auditLogService, transactionManager);
            CustomerService customerService = new CustomerService(customerRepository);
            CategoryService categoryService = new CategoryService(categoryRepository, auditLogService, transactionManager);
            WarrantyService warrantyService = new WarrantyService(warrantyRepository, productItemRepository, orderRepository, auditLogService, stockService, transactionManager);
            AiAgentService aiAgentService = LangChainConfig.getAssistant();
            // Controller
            UserController userController = new UserController(userService);
            AuditLogController auditLogController = new AuditLogController(auditLogService);
            SupplierController supplierController = new SupplierController(supplierService);
            CategoryController categoryController = new CategoryController(categoryService);
            CustomerController customerController = new CustomerController(customerService);
            DashboardController dashboardController = new DashboardController(dashboardService);
            OrderController orderController = new OrderController(orderService);
            WarehouseController warehouseController = new WarehouseController(warehouseService);
            AuthController authController = new AuthController(authService, jwtUtils);
            CloudinaryController cloudinaryController = new CloudinaryController(cloudinaryService);
            AiAgentController aiAgentController = new AiAgentController(aiAgentService);
            ProductController productController = new ProductController(productService);
            InventoryController inventoryController = new InventoryController(inventoryService);
            StockController stockController = new StockController(stockService);
            WarrantyController warrantyController = new WarrantyController(warrantyService);

            // Servlet Context
            ServletContext ctx = sce.getServletContext();
            ctx.setAttribute("corsConfig", corsConfig);
            ctx.setAttribute("securityHandler", securityHandler);
            ctx.setAttribute("authTokenFilter", authTokenFilter);
            ctx.setAttribute("refreshTokenService", refreshTokenService);
            ctx.setAttribute("jwtUtils", jwtUtils);
            // Controller Context
            ctx.setAttribute("agentController", aiAgentController);
            ctx.setAttribute("logsController", auditLogController);
            ctx.setAttribute("authController", authController);
            ctx.setAttribute("categoryController", categoryController);
            ctx.setAttribute("customerController", customerController);
            ctx.setAttribute("cloudinaryController", cloudinaryController);
            ctx.setAttribute("dashboardController", dashboardController);
            ctx.setAttribute("inventoryController", inventoryController);
            ctx.setAttribute("stockController", stockController);
            ctx.setAttribute("supplierController", supplierController);
            ctx.setAttribute("orderController", orderController);
            ctx.setAttribute("customerController", customerController);
            ctx.setAttribute("productController", productController);
            ctx.setAttribute("userController", userController);
            ctx.setAttribute("warehouseController", warehouseController);
            ctx.setAttribute("warrantyController", warrantyController);
        } catch (Exception e) {
            log.error("Error during startup: {}", e.getMessage(), e);
            throw new RuntimeException(Message.Exception.APPLICATION_START_FAILED, e);
        }

    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        DatabaseConfig.close();
        log.info("Application closed");
    }
}