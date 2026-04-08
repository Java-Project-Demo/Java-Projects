package org.dawn.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.config.response.ResponsePage;
import org.dawn.backend.dto.request.RegisterRequest;
import org.dawn.backend.dto.response.UserResponse;
import org.dawn.backend.entity.UserDetailsImpl;
import org.dawn.backend.service.UserService;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/user")
@Tag(name = "User", description = "Operations related to user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("")
    public ResponseObject<ResponsePage<UserResponse>> getAll(Pageable pageable) {
        return ResponseObject.success(userService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseObject<UserResponse> getOne(@PathVariable Long id) {
        return ResponseObject.success(userService.findOne(id));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseObject<UserResponse> create(
            @RequestBody RegisterRequest req,
            @AuthenticationPrincipal UserDetailsImpl admin) {
        return ResponseObject.success(userService.createUser(req, admin.getUsername()));
    }

    @PutMapping("/{id}/reset-password")
    @PreAuthorize("@roleSecurity.canUpdate(#id, authentication)")
    public ResponseObject<UserResponse> update(
            @PathVariable Long id,
            @RequestBody RegisterRequest req,
            @AuthenticationPrincipal UserDetailsImpl admin) {
        return ResponseObject.success(userService.updateInfo(id, req, admin.getUsername()));
    }

    @PutMapping("/update/{id}/status")
    @PreAuthorize("@roleSecurity.canUpdate(#id, authentication)")
    public ResponseObject<UserResponse> updateStatus(@PathVariable Long id, @RequestBody Boolean status) {
        return ResponseObject.success(userService.updateStatus(id, status));
    }
}
