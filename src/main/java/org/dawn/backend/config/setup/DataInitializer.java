package org.dawn.backend.config.setup;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.sys.AppConfig;
import org.dawn.backend.config.security.hashing.PasswordEncoder;
import org.dawn.backend.constant.Message;
import org.dawn.backend.constant.URole;
import org.dawn.backend.entity.Role;
import org.dawn.backend.entity.User;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.RoleRepository;
import org.dawn.backend.repository.UserRepository;

@Slf4j
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;


    public void run() {
        try {
            createAdminAccountIfNotExist();
        } catch (Exception e) {
            log.error("Error initializing setup account", e);
        }
    }

    //    Note: This just for demo, don't use this in production
    private void createAdminAccountIfNotExist() {
        String adminUsername = AppConfig.get("setup.admin.username");
        String adminPassword = AppConfig.get("setup.admin.password");
        if (userRepository.existsByUserName(adminUsername)) {
            log.info("Admin account '{}' already exists. Skipping initialization.", adminUsername);
            return;
        }

        Role role = roleRepository
                .findByName(URole.ADMIN)
                .orElseThrow(() ->
                        new ResourceNotFoundException(Message.Exception.ROLE_NOT_FOUND));

        User user = User
                .builder()
                .username(adminUsername)
                .password(passwordEncoder.encode(adminPassword))
                .role(role)
                .isDeleted(false)
                .build();

        userRepository.save(user);

        log.info("========================================");
        log.info("   DEMO ADMIN ACCOUNT CREATED");
        log.info("   Username: {}", adminUsername);
        log.info("   Password: {}", adminPassword);
        log.info("========================================");
    }
}
