package org.dawn.backend.controller.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.annotation.Get;
import org.dawn.backend.config.web.annotation.Post;
import org.dawn.backend.config.web.annotation.Put;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.config.security.UserRoleSecurity;
import org.dawn.backend.config.web.response.ResponsePage;
import org.dawn.backend.constant.auth.URole;
import org.dawn.backend.controller.base.AbstractController;
import org.dawn.backend.dto.auth.CreateUserResponse;
import org.dawn.backend.dto.auth.RegisterRequest;
import org.dawn.backend.dto.auth.UpdateInfoRequest;
import org.dawn.backend.dto.auth.UserResponse;
import org.dawn.backend.service.auth.UserService;


@RequiredArgsConstructor
public class UserController extends AbstractController {

    private final UserService userService;

    @Get("/")
    public ResponseObject<ResponsePage<UserResponse>> getAll(HttpServletRequest req, HttpServletResponse res) {
        checkRole(URole.ADMIN.name());
        int page = Integer.parseInt(req.getParameter("page") != null ? req.getParameter("page") : "0");
        int size = Integer.parseInt(req.getParameter("size") != null ? req.getParameter("size") : "10");


        return ResponseObject.success(userService.findAll(page, size));
    }

    @Get("/{id}")
    public ResponseObject<UserResponse> getOne(HttpServletRequest req, HttpServletResponse res) {
        checkRole(URole.ADMIN.name());
        return ResponseObject.success(userService.findOne(getPathId(req)));
    }

    @Post("/")
    public ResponseObject<CreateUserResponse> create(HttpServletRequest req, HttpServletResponse res) {
        checkRole(URole.ADMIN.name());
        RegisterRequest dto = body(req, RegisterRequest.class);
        return ResponseObject.created(userService.createUser(dto));
    }

    @Put("/{id}/info")
    public ResponseObject<UserResponse> updateInfo(HttpServletRequest req, HttpServletResponse res) throws Exception {
        Long id = getPathId(req);
        UserRoleSecurity.authorize(id);
        UpdateInfoRequest info = body(req, UpdateInfoRequest.class);
        return ResponseObject.success(userService.updateInfo(id, info));
    }

    @Put("/{id}/status")
    public ResponseObject<UserResponse> updateStatus(HttpServletRequest req, HttpServletResponse res) throws Exception {
        checkRole(URole.ADMIN.name());
        Long id = getPathId(req);
        Boolean status = body(req, Boolean.class);
        return ResponseObject.success(userService.updateStatus(id, status));
    }

    @Put("/{id}/role")
    public ResponseObject<UserResponse> updateRole(HttpServletRequest req, HttpServletResponse res) throws Exception {
        checkRole(URole.ADMIN.name());
        Long id = getPathId(req);
        URole role = body(req, URole.class);
        return ResponseObject.success(userService.updateRole(id, role));
    }
}
