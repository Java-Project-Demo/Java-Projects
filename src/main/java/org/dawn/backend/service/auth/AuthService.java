package org.dawn.backend.service.auth;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.database.TransactionManager;
import org.dawn.backend.config.security.hashing.PasswordEncoder;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.auth.ChangePasswordRequest;
import org.dawn.backend.dto.auth.LoginRequest;
import org.dawn.backend.dto.auth.JwtResponse;
import org.dawn.backend.dto.auth.TokenRefreshResponse;
import org.dawn.backend.entity.RefreshToken;
import org.dawn.backend.entity.User;
import org.dawn.backend.exception.wrapper.PermissionDeniedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.auth.UserRepository;
import org.dawn.backend.service.system.AuditLogService;
import org.dawn.backend.utils.JWTUtils;
import org.dawn.backend.utils.UserUtils;

@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final AuditLogService auditLogService;
    private final TransactionManager manager;

    public JwtResponse login(LoginRequest req) {

        String identifier = req.getUsername();

        User user = userRepository
                .findByUsername(req.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USER_NOT_FOUND));
        log.info("Get username :{}", identifier);

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new PermissionDeniedException("Invalid password");
        }
        String jwt = jwtUtils.generateToken(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().getName().name());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        auditLogService.saveLog(
                user.getId(),
                LogConstant.Action.LOGIN,
                LogConstant.Entity.AUTH,
                user.getId().toString(),
                LogConstant.Status.SUCCESS,
                "User login to system");

        return JwtResponse
                .builder()
                .userId(user.getId())
                .username(user.getUsername())
                .accessToken(jwt)
                .refreshToken(refreshToken.getToken())
                .isPasswordReset(Boolean.TRUE.equals(user.getIsPasswordReset()))
                .build();
    }


    public String resetPassword(Long id, String username) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USERNAME_NOT_FOUND));
        String tempPwd = UserUtils.generateTempPassword();

        user.setPassword(passwordEncoder.encode(tempPwd));
        user.setIsPasswordReset(true);
        userRepository.save(user);

        refreshTokenService.deleteByUserId(id);
        auditLogService.saveLog(
                LogConstant.Action.RESET_PASSWORD,
                LogConstant.Entity.AUTH,
                user.getId().toString(),
                LogConstant.Status.SUCCESS,
                "User reset password");
        return tempPwd;
    }

    public String changePassword(String username, ChangePasswordRequest request) {
        log.info("Get username from change password: {}", username);
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USERNAME_NOT_FOUND));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new PermissionDeniedException(Message.Exception.PASSWORD_NOT_MATCH);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException(Message.Exception.PASSWORD_NOT_MATCH);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        user.setIsPasswordReset(false);
        userRepository.save(user);
        auditLogService.saveLog(
                LogConstant.Action.CHANGE_PASSWORD,
                LogConstant.Entity.AUTH,
                user.getId().toString(),
                LogConstant.Status.SUCCESS,
                "User change password");
        return "Change password success";
    }


    public TokenRefreshResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new ResourceNotFoundException(Message.Exception.REFRESH_TOKEN_EXPIRED);
        }

        return refreshTokenService.findByToken(refreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String jwtCookie = jwtUtils.generateToken(user.getUsername());
                    return TokenRefreshResponse
                            .builder()
                            .accessToken(jwtCookie)
                            .build();
                })
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.REFRESH_TOKEN_NOT_FOUND));
    }
}
