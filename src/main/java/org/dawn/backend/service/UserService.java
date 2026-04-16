package org.dawn.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.PasswordEncoder;
import org.dawn.backend.config.response.PageResponse;
import org.dawn.backend.config.response.ResponsePage;
import org.dawn.backend.constant.Message;
import org.dawn.backend.constant.URole;
import org.dawn.backend.dto.request.RegisterRequest;
import org.dawn.backend.dto.response.UserResponse;
import org.dawn.backend.entity.Role;
import org.dawn.backend.entity.User;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.helper.UserMappingHelper;
import org.dawn.backend.repository.RoleRepository;
import org.dawn.backend.repository.UserRepository;
import org.dawn.backend.utils.UserUtils;

import javax.sql.DataSource;


@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataSource dataSource;

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

    public UserResponse createUser(RegisterRequest request, String adminUsername) {
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
                .password(passwordEncoder.encode(tempPass))
                .gender(request.getGender())
                .age(request.getAge())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .status(request.getStatus() != null ? request.getStatus() : "NEW")
                .role(role)
                .isPasswordReset(true)
                .build();
        userRepository.save(user);
        return UserMappingHelper.map(user);
    }

    public UserResponse updateStatus(Long id, Boolean status) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USERNAME_NOT_FOUND));
        user.setIsDeleted(status);
        return UserMappingHelper.map(userRepository.save(user));
    }

    public UserResponse updateInfo(Long id, RegisterRequest request, String username) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USERNAME_NOT_FOUND));
        user.setFullName(request.getFullName());
        user.setGender(request.getGender());
        user.setAge(request.getAge());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setEmail(request.getEmail());
        user.setStatus(request.getStatus());

        Role role = roleRepository.findByName(URole.valueOf(request.getRoleName())).orElse(user.getRole());
        user.setRole(role);

        return UserMappingHelper.map(userRepository.save(user));
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
