package org.dawn.backend;

import jakarta.servlet.MultipartConfigElement;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.Context;
import org.apache.catalina.Wrapper;
import org.apache.catalina.startup.Tomcat;
import org.apache.tomcat.util.descriptor.web.FilterDef;
import org.apache.tomcat.util.descriptor.web.FilterMap;
import org.dawn.backend.config.security.SecurityConfig;
import org.dawn.backend.exception.ApiExceptionHandler;


import java.io.File;

@Slf4j
public class BackendApplication {

    public static void main(String[] args) {
        int port = AppConfig.get("server.port") != null ? AppConfig.getInt("server.port") : 8888;

        Tomcat server = new Tomcat();
        server.setPort(port);

        server.getConnector();

        String baseDir = new File(".").getAbsolutePath();
        Context ctx = server.addContext("", baseDir);
        // Global Context Listener
        ctx.addApplicationListener(GlobalContextListener.class.getName());


        // API Exception Handler
        FilterDef exceptionFilterDef = new FilterDef();
        exceptionFilterDef.setFilterName("ApiExceptionHandler");
        exceptionFilterDef.setFilterClass(ApiExceptionHandler.class.getName());
        ctx.addFilterDef(exceptionFilterDef);

        FilterMap exceptionfilterMap = new FilterMap();
        exceptionfilterMap.setFilterName("ApiExceptionHandler");
        exceptionfilterMap.addURLPattern("/*");
        ctx.addFilterMap(exceptionfilterMap);

        // Security Filter
        FilterDef securityFilterDef = new FilterDef();
        securityFilterDef.setFilterName("SecurityConfig");
        securityFilterDef.setFilterClass(SecurityConfig.class.getName());
        ctx.addFilterDef(securityFilterDef);

        FilterMap securityFilterMap = new FilterMap();
        securityFilterMap.setFilterName("SecurityConfig");
        securityFilterMap.addURLPattern("/*");
        ctx.addFilterMap(securityFilterMap);


        // API Dispatcher
        ApiDispatcher apiDispatcher = new ApiDispatcher();
        Wrapper servletWrapper = Tomcat.addServlet(ctx, "apiDispatcher", apiDispatcher);
        servletWrapper.setMultipartConfigElement(new MultipartConfigElement(System.getProperty("java.io.tmpdir")));
        ctx.addServletMappingDecoded("/api/v1/*", "apiDispatcher");

        log.info("Starting Tomcat on port: {}", port);
        try {
            server.start();
            log.info("Application started at http://localhost:{}/api/v1", port);
            server.getServer().await();
        } catch (Exception e) {
            log.error("Error starting Tomcat: {}", e.getMessage());
        }
    }

}
