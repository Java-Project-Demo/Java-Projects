package org.dawn.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.annotation.Get;
import org.dawn.backend.config.annotation.Post;
import org.dawn.backend.config.annotation.Put;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.config.response.ResponsePage;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.dto.request.RegisterRequest;
import org.dawn.backend.dto.response.UserResponse;
import org.dawn.backend.service.UserService;


@RequiredArgsConstructor
public class UserController extends AbstractController {

    private final UserService userService;

    @Get("/")
    public ResponseObject<ResponsePage<UserResponse>> getAll(HttpServletRequest req) {
        int page = Integer.parseInt(req.getParameter("page") != null ? req.getParameter("page") : "0");
        int size = Integer.parseInt(req.getParameter("size") != null ? req.getParameter("size") : "10");


        return ResponseObject.success(userService.findAll(page, size));
    }

    @Get("/{id}")
    public ResponseObject<UserResponse> getOne(HttpServletRequest req) {
        return ResponseObject.success(userService.findOne(getPathId(req)));
    }

    @Post("/")
    public ResponseObject<UserResponse> create(HttpServletRequest req) {
        RegisterRequest dto = body(req, RegisterRequest.class);
        return ResponseObject.created(userService.createUser(dto, "admin"));
    }

    @Put("/{id}/status")
    public ResponseObject<UserResponse> updateStatus(HttpServletRequest req) throws Exception {
        Long id = getPathId(req);
        Boolean status = body(req, Boolean.class);
        return ResponseObject.success(userService.updateStatus(id, status));
    }
}
