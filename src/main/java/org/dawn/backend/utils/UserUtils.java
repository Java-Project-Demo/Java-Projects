package org.dawn.backend.utils;

import java.security.SecureRandom;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class UserUtils {

    private static final String CHAR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public static String generateUsername(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "USER" + (new Random().nextInt(900) + 100);
        }

        String[] words = fullName.trim().split("\\s+");
        StringBuilder initials = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) initials.append(Character.toUpperCase(word.charAt(0)));
        }
        int randomNum = ThreadLocalRandom.current().nextInt(100, 1000);
        return initials.toString() + randomNum;
    }

    public static String generateTempPassword() {
        int length = 10;
        return IntStream
                .range(0, length)
                .map(i -> SECURE_RANDOM.nextInt(CHAR_POOL.length()))
                .mapToObj(CHAR_POOL::charAt)
                .map(Object::toString)
                .collect(Collectors.joining());
    }
}
