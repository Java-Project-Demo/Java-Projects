package org.dawn.backend.service.auth;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.Loggable;
import org.dawn.backend.config.web.response.ResponsePage;
import org.dawn.backend.constant.auth.URole;
import org.dawn.backend.constant.system.ActiveStatus;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.auth.*;
import org.dawn.backend.entity.Role;
import org.dawn.backend.entity.User;
import org.dawn.backend.exception.wrapper.InvalidRequestException;
import org.dawn.backend.exception.wrapper.PermissionDeniedException;
import org.dawn.backend.exception.wrapper.ResourceAlreadyExistedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.auth.RoleRepository;
import org.dawn.backend.repository.auth.UserRepository;
import org.dawn.backend.utils.SecurityContext;
import org.dawn.backend.utils.UserUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;


@RequiredArgsConstructor
@Slf4j
@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public ResponsePage<UserResponse> findAll(Pageable pageable) {
        return ResponsePage.of(userRepository
                .findAll(pageable)
                .map(UserMappingHelper::map));
    }

    public UserResponse findOne(Long id) {
        return userRepository
                .findById(id)
                .map(UserMappingHelper::map)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USER_NOT_FOUND));
    }

    public UserResponse findByUsername(String username) {
        return userRepository
                .findByUsername(username)
                .map(UserMappingHelper::map)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USER_NOT_FOUND));
    }

    @Loggable(
            action = LogConstant.Action.CREATE_USER,
            entity = LogConstant.Entity.USER,
            message = "'Create new user'"
    )
    @Transactional
    public CreateUserResponse createUser(RegisterRequest request) {
        if (URole.ADMIN.name().equalsIgnoreCase(request.getRoleName())) {
            throw new PermissionDeniedException(Message.Exception.CAN_NOT_ASSIGN_ADMIN_ROLE);
        }

        String email = request.getEmail();
        if (email != null) {
            email = email.trim();
            if (email.isEmpty()) {
                email = null;
            } else {
                if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                    throw new InvalidRequestException(Message.Exception.EMAIL_INVALID_FORMAT);
                }
                if (userRepository.findByEmail(email).isPresent()) {
                    throw new ResourceAlreadyExistedException(Message.Exception.EMAIL_ALREADY_USED);
                }
            }
        }

        String baseUsername = UserUtils.getBaseUsername(request.getFullName());

        String finalUsername = baseUsername;

        int counter = 1;

        while (userRepository.existsByUsername(finalUsername)) {
            finalUsername = baseUsername + counter;
            counter++;
        }


        String tempPass = UserUtils.generateTempPassword();

        Role role = roleRepository
                .findByName(URole.valueOf(request.getRoleName()))
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ROLE_NOT_FOUND));

        User user = User.builder()
                .username(finalUsername)
                .fullName(request.getFullName())
                .email(email)
                .password(passwordEncoder.encode(tempPass))
                .status(request.getStatus() != null ? request.getStatus() : "NEW")
                .role(role)
                .isPasswordReset(true)
                .build();
        User savedUser = userRepository.save(user);

        UserResponse base = UserMappingHelper.map(savedUser);
        return CreateUserResponse.builder()
                .id(base.getId())
                .username(base.getUsername())
                .fullName(base.getFullName())
                .email(base.getEmail())
                .role(base.getRole())
                .status(base.getStatus())
                .gender(base.getGender())
                .dob(base.getDob())
                .phoneNumber(base.getPhoneNumber())
                .isPasswordReset(base.getIsPasswordReset())
                .isDeleted(base.getIsDeleted())
                .createdAt(base.getCreatedAt())
                .updatedAt(base.getUpdatedAt())
                .tempPassword(tempPass)
                .build();
    }

    @Loggable(
            action = LogConstant.Action.UPDATE_STATUS,
            entity = LogConstant.Entity.USER,
            entityId = "#result?.id",
            message = "'Update user status'"
    )
    @Transactional
    public UserResponse updateStatus(Long id, Boolean status) {
        if (Objects.equals(id, SecurityContext.getCurrentUserId())) {
            throw new PermissionDeniedException(Message.Exception.CAN_NOT_UPDATE_YOURSELF);
        }

        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USERNAME_NOT_FOUND));
        user.setIsDeleted(!status);
        user.setStatus(status ? ActiveStatus.ACTIVE.name() : ActiveStatus.INACTIVE.name());
        User savedUser = userRepository.save(user);
        return UserMappingHelper.map(savedUser);
    }

    @Loggable(
            action = LogConstant.Action.UPDATE_INFO,
            entity = LogConstant.Entity.USER,
            entityId = "#result?.id",
            message = "'Update user info'"
    )
    @Transactional
    public UserResponse updateInfo(Long id, UpdateInfoRequest request) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USERNAME_NOT_FOUND));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getDob() != null) {
            user.setDob(request.getDob());
        }
        if (request.getPhoneNumber() != null) {
            String phone = request.getPhoneNumber().trim();
            user.setPhoneNumber(phone.isEmpty() ? null : phone);
        }
        User savedUser = userRepository.save(user);
        return UserMappingHelper.map(savedUser);
    }

    @Loggable(
            action = LogConstant.Action.UPDATE_ROLE,
            entity = LogConstant.Entity.USER,
            entityId = "#result?.id",
            message = "'Update user role'"
    )
    @Transactional
    public UserResponse updateRole(Long id, URole roleName) {
        if (Objects.equals(id, SecurityContext.getCurrentUserId())) {
            throw new PermissionDeniedException(Message.Exception.CAN_NOT_CHANGE_OWN_ROLE);
        }

        if (URole.ADMIN.equals(roleName)) {
            throw new PermissionDeniedException(Message.Exception.CAN_NOT_ASSIGN_ADMIN_ROLE);
        }

        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USERNAME_NOT_FOUND));

        Role role = roleRepository.findByName(roleName).orElse(user.getRole());
        user.setRole(role);

        User savedUser = userRepository.save(user);
        return UserMappingHelper.map(savedUser);
    }

    public boolean existsByRoleName(String roleName) {
        Role role = roleRepository
                .findByName(URole.valueOf(roleName))
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ROLE_NOT_FOUND));

        return userRepository.existsByRole_Name(role.getName().toString());
    }

    public Role findByRoleName(String roleName) {
        Role role = roleRepository
                .findByName(URole.valueOf(roleName))
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ROLE_NOT_FOUND));

        return Role.builder().name(role.getName()).build();
    }
}
