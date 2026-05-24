package org.dawn.backend.service.auth;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.Loggable;
import org.dawn.backend.constant.system.LogConstant;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.dto.auth.*;
import org.dawn.backend.entity.PasswordResetToken;
import org.dawn.backend.entity.RefreshToken;
import org.dawn.backend.entity.User;
import org.dawn.backend.exception.ApiException;
import org.dawn.backend.exception.wrapper.PermissionDeniedException;
import org.dawn.backend.exception.wrapper.ResourceNotFoundException;
import org.dawn.backend.repository.auth.PasswordResetTokenRepository;
import org.dawn.backend.repository.auth.UserRepository;
import org.dawn.backend.service.system.MailService;
import org.dawn.backend.utils.JWTUtils;
import org.dawn.backend.utils.UserUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    @Value("${app.frontendUrl}")
    String frontendUrl;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final MailService mailService;

    @Loggable(
            action = LogConstant.Action.LOGIN,
            entity = LogConstant.Entity.AUTH,
            entityId = "#result.userId",
            message = "'User login to system'"
    )
    public JwtResponse login(LoginRequest req) {

        String identifier = req.getUsername();

        User user = userRepository
                .findByUsername(req.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USER_NOT_FOUND));
        log.info("Get username :{}", identifier);

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new PermissionDeniedException(Message.Exception.INVALID_PASSWORD);
        }

        if (Boolean.TRUE.equals(user.getIsDeleted()) || !"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new PermissionDeniedException(Message.Exception.USER_INACTIVE);
        }

        String jwt = jwtUtils.generateToken(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().getName().name());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        return JwtResponse
                .builder()
                .userId(user.getId())
                .username(user.getUsername())
                .accessToken(jwt)
                .refreshToken(refreshToken.getToken())
                .isPasswordReset(Boolean.TRUE.equals(user.getIsPasswordReset()))
                .build();
    }

    @Loggable(
            action = LogConstant.Action.RESET_PASSWORD,
            entity = LogConstant.Entity.AUTH,
            message = "'User reset password'"
    )
    public String resetPassword(Long id, String username) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USERNAME_NOT_FOUND));
        String tempPwd = UserUtils.generateTempPassword();

        user.setPassword(passwordEncoder.encode(tempPwd));
        user.setIsPasswordReset(true);
        userRepository.save(user);

        refreshTokenService.deleteByUserId(id);
        return tempPwd;
    }

    @Loggable(
            action = LogConstant.Action.CHANGE_PASSWORD,
            entity = LogConstant.Entity.AUTH,
            message = "'User change password'"
    )
    public String changePassword(String username, ChangePasswordRequest request) {
        log.info("Get username from change password: {}", username);
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USERNAME_NOT_FOUND));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new PermissionDeniedException(Message.Exception.PASSWORD_NOT_MATCH);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ApiException(Message.Exception.PASSWORD_NOT_MATCH);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        user.setIsPasswordReset(false);
        userRepository.save(user);
        return "Change password success";
    }

    @Loggable(
            action = LogConstant.Action.RESET_PASSWORD,
            entity = LogConstant.Entity.AUTH,
            message = "'Forgot password email sent'"
    )
    public String forgotPassword(ForgotPasswordRequest req) {
        String email = req.getEmail();
        if (email == null || email.isBlank()) {
            throw new ApiException(Message.Exception.EMAIL_NOT_EMPTY);
        }

        User user = userRepository
                .findByEmail(email.trim())
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.EMAIL_NOT_FOUND));

        passwordResetTokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plus(15, ChronoUnit.MINUTES);
        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .userId(user.getId())
                .token(token)
                .expiryDate(expiry)
                .build());


        if (frontendUrl == null || frontendUrl.isBlank()) frontendUrl = "http://localhost:5173";
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        mailService.sendPasswordResetMail(email.trim(), user.getFullName(), resetLink);
        return "Email đặt lại mật khẩu đã được gửi";
    }

    @Loggable(
            action = LogConstant.Action.CHANGE_PASSWORD,
            entity = LogConstant.Entity.AUTH,
            message = "'Password reset via token'"
    )
    public String resetPasswordByToken(ResetPasswordTokenRequest req) {
        if (req.getToken() == null || req.getToken().isBlank()) {
            throw new ApiException(Message.Exception.INVALID_TOKEN);
        }
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new ApiException(Message.Exception.PASSWORD_NOT_MATCH);
        }
        if (req.getNewPassword().length() < 6) {
            throw new ApiException(Message.Exception.PASSWORD_TOO_SHORT);
        }

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(req.getToken())
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.TOKEN_INVALID_OR_EXPIRED));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new ApiException(Message.Exception.TOKEN_USED);
        }
        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            throw new ApiException(Message.Exception.TOKEN_EXPIRED);
        }

        User user = userRepository
                .findById(resetToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(Message.Exception.USER_NOT_FOUND));

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setIsPasswordReset(false);
        userRepository.save(user);

        passwordResetTokenRepository.markUsed(resetToken.getId());
        refreshTokenService.deleteByUserId(user.getId());
        return "Đặt lại mật khẩu thành công";
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
