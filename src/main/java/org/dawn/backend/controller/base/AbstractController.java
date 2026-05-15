package org.dawn.backend.controller.base;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.config.security.UserPrincipal;
import org.dawn.backend.config.web.annotation.Delete;
import org.dawn.backend.config.web.annotation.Get;
import org.dawn.backend.config.web.annotation.Post;
import org.dawn.backend.config.web.annotation.Put;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.exception.wrapper.AuthorizedDeniedException;
import org.dawn.backend.exception.wrapper.PermissionDeniedException;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
public abstract class AbstractController extends HttpServlet {
    protected final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    private final Map<String, Method> routeMap = new HashMap<>();


    public AbstractController() {
        for (Method method : this.getClass().getDeclaredMethods()) {
            if (method.isAnnotationPresent(Get.class))
                routeMap.put("GET:" + method.getAnnotation(Get.class).value(), method);
            else if (method.isAnnotationPresent(Post.class))
                routeMap.put("POST:" + method.getAnnotation(Post.class).value(), method);
            else if (method.isAnnotationPresent(Put.class))
                routeMap.put("PUT:" + method.getAnnotation(Put.class).value(), method);
            else if (method.isAnnotationPresent(Delete.class))
                routeMap.put("DELETE:" + method.getAnnotation(Delete.class).value(), method);
        }

    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        try {
            String path = req.getPathInfo() == null ? "/" : req.getPathInfo();
            String cleanPath = path.replaceFirst("^/[^/]+", "");
            if (cleanPath.isEmpty()) cleanPath = "/";

            String routePath = cleanPath.replaceAll("/\\d+", "/{id}");
            String methodKey = req.getMethod() + ":" + routePath;
            log.info("Match route: {}", methodKey);

            Method method = routeMap.get(methodKey);

            if (method != null) {
                Object result;
                if (method.getParameterCount() == 2) {
                    result = method.invoke(this, req, res);

                } else {
                    result = method.invoke(this, req);
                }
                render(res, result);
            } else {
                log.warn("No method found for key: {}", methodKey);
                res.setStatus(404);
            }
        } catch (Exception e) {
            log.error("API Error", e);
            if (e instanceof RuntimeException) throw (RuntimeException) e;
            throw new ServletException(e);
        }
    }


    protected <T> T body(HttpServletRequest req, Class<T> clazz) {
        try {
            return mapper.readValue(req.getInputStream(), clazz);
        } catch (IOException e) {
            log.error("Body exception: {}", e.getMessage());
            throw new RuntimeException(Message.Exception.COULD_NOT_READ_BODY);
        }
    }

    protected Long getPathId(HttpServletRequest req) {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null) return null;
        Matcher matcher = Pattern.compile("/(\\d+)").matcher(pathInfo);

        if (matcher.find()) return Long.valueOf(matcher.group(1));

        return null;
    }

    protected UserPrincipal currentUser() {
        return SecurityContext.get();
    }

    protected void checkRole(String... allowedRoles) {
        UserPrincipal user = currentUser();
        if (user == null) throw new AuthorizedDeniedException(Message.Exception.UNAUTHORIZED);

        boolean hasAccess = Arrays.asList(allowedRoles).contains(user.role());
        if (!hasAccess) throw new PermissionDeniedException(Message.Exception.FORBIDDEN);
    }

    protected String query(HttpServletRequest req, String name) {
        return req.getParameter(name);
    }

    protected int queryInt(HttpServletRequest req, String name, int defaultValue) {
        String val = req.getParameter(name);
        return (val == null) ? defaultValue : Integer.parseInt(val);
    }

    protected String getCookie(HttpServletRequest req, String name) {
        Cookie[] cookies = req.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) if (c.getName().equals(name)) return c.getValue();
        }
        return null;
    }

    private void render(HttpServletResponse res, Object data) throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        Object finalRes = (data instanceof ResponseObject)
                ? data
                : ResponseObject.success(data);

        if (finalRes instanceof ResponseObject<?> ro) {
            res.setStatus(200);
        }
        res.getWriter().write(mapper.writeValueAsString(finalRes));
    }


    private void renderError(HttpServletResponse res, Exception e) {
        try {
            res.setStatus(500);
            Throwable cause = (e.getCause() != null) ? e.getCause() : e;
            res.getWriter().write(mapper.writeValueAsString(ResponseObject.error(500, cause.getMessage())));
        } catch (IOException ignored) {

        }
    }
}
