package org.dawn.backend;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.controller.UserController;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;

import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Slf4j
public class ApiDispatcher extends HttpServlet {

    private final Map<String, AbstractController> controllerMap = new HashMap<>();

    @Override
    public void init() throws ServletException {
        ServletContext ctx = getServletContext();
        Enumeration<String> attrNames = ctx.getAttributeNames();

        while (attrNames.hasMoreElements()) {
            String name = attrNames.nextElement();
            Object attr = ctx.getAttribute(name);

            if (attr instanceof AbstractController) {
                String prefix = name.replace("Controller", "").toLowerCase();
                controllerMap.put(prefix, (AbstractController) attr);
                log.info("Auto register route: /api/v1/{}/*", prefix);

            }
        }
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();

        log.info("API Dispatcher received pathInfo: {}", pathInfo);
        if (pathInfo == null || pathInfo.equals("/")) {
            throw new ResourceNotFoundException("API Endpoint not found");
        }

        String[] parts = pathInfo.split("/");
        if (parts.length < 2) {
            throw new RuntimeException("Missing Resource Name");
        }

        String prefix = parts[1].toLowerCase();

        AbstractController controller = controllerMap.get(prefix);

        if (controller != null) {
            log.info("Dispatching [{}] {} -> {}", req.getMethod(), pathInfo, controller.getClass().getSimpleName());
            controller.service(req, res);
        } else {
            log.warn("No controller found for prefix: {}", prefix);
            throw new ResourceNotFoundException("Controller not found");
        }

    }
}
