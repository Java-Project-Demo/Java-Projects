package org.dawn.backend.config.security.hashing;

import org.mindrot.jbcrypt.BCrypt;

public class BCryptPasswordEncoderImpl implements PasswordEncoder {
    @Override
    public String encode(CharSequence rawPassword) {
        return BCrypt.hashpw(rawPassword.toString(), BCrypt.gensalt(12));
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        try {
            return BCrypt.checkpw(rawPassword.toString(), encodedPassword);
        } catch (Exception e) {
            return false;
        }
    }
}
