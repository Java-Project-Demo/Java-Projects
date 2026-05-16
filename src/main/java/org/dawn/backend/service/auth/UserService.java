package org.dawn.backend.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.config.web.response.PageResponse;
import org.dawn.backend.config.web.response.ResponsePage;
import org.dawn.backend.config.security.hashing.PasswordEncoder;
import org.dawn.backend.constant.system.ActiveStatus;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.constant.auth.URole;
import org.dawn.backend.dto.auth.CreateUserResponse;
import org.dawn.backend.dto.auth.RegisterRequest;
import org.dawn.backend.dto.auth.UpdateInfoRequest;
import org.dawn.backend.dto.auth.UserResponse;
import org.dawn.backend.entity.Role;
import org.dawn.backend.entity.User;
import org.dawn.backend.exception.wrapper.InvalidRequestException;
import org.dawn.backend.exception.wrapper.PermissionDeniedException;
import org.dawn.backend.exception.wrapper.ResourceAlreadyExistedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.dto.auth.UserMappingHelper;
import org.dawn.backend.repository.auth.RoleRepository;
import org.dawn.backend.repository.auth.UserRepository;
import org.dawn.backend.service.system.AuditLogService;
import org.dawn.backend.utils.UserUtils;

import java.util.Objects;


@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final TransactionManager manager;

    public ResponsePage<UserResponse> findAll(int page, int size) {
        PageResponse<User> users = userRepository.findAll(page, size);
        return ResponsePage.of(users, UserMappingHelper::map);
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

    public CreateUserResponse createUser(RegisterRequest request) {
        return manager.execute(() -> {
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

            while (userRepository.existsByUserName(finalUsername)) {
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

            auditLogService.saveLog(
                    LogConstant.Action.CREATE_USER,
                    LogConstant.Entity.USER,
                    savedUser.getId().toString(),
                    LogConstant.Status.SUCCESS,
                    "Create new user");

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
        });
    }

    public UserResponse updateStatus(Long id, Boolean status) {
        return manager.execute(() -> {

            if (Objects.equals(id, SecurityContext.get().id())) {
                throw new PermissionDeniedException(Message.Exception.CAN_NOT_UPDATE_YOURSELF);
            }

            User user = userRepository
                    .findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USERNAME_NOT_FOUND));
            user.setIsDeleted(!status);
            user.setStatus(status ? ActiveStatus.ACTIVE.name() : ActiveStatus.INACTIVE.name());
            User savedUser = userRepository.save(user);
            auditLogService.saveLog(
                    LogConstant.Action.UPDATE_STATUS,
                    LogConstant.Entity.USER,
                    savedUser.getId().toString(),
                    LogConstant.Status.SUCCESS,
                    "Update user status");
            return UserMappingHelper.map(savedUser);
        });
    }

    public UserResponse updateInfo(Long id, UpdateInfoRequest request) {
        return manager.execute(() -> {
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
            auditLogService.saveLog(
                    LogConstant.Action.UPDATE_INFO,
                    LogConstant.Entity.USER,
                    savedUser.getId().toString(),
                    LogConstant.Status.SUCCESS,
                    "Update user info");
            return UserMappingHelper.map(savedUser);
        });
    }

    public UserResponse updateRole(Long id, URole roleName) {
        return manager.execute(() -> {

            if (Objects.equals(id, SecurityContext.get().id())) {
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
            auditLogService.saveLog(
                    LogConstant.Action.UPDATE_ROLE,
                    LogConstant.Entity.USER,
                    savedUser.getId().toString(),
                    LogConstant.Status.SUCCESS,
                    "Update user role");
            return UserMappingHelper.map(savedUser);
        });
    }

    public boolean existsByRoleName(String roleName) {
        Role role = roleRepository
                .findByName(URole.valueOf(roleName))
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ROLE_NOT_FOUND));

        return userRepository.existsByRoleName(role.getName().toString());
    }

    public Role findByRoleName(String roleName) {
        Role role = roleRepository
                .findByName(URole.valueOf(roleName))
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.ROLE_NOT_FOUND));

        return Role.builder().name(role.getName()).build();
    }
}
