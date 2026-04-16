package org.dawn.backend.config.cloudinary;

import com.cloudinary.Cloudinary;
import org.dawn.backend.AppConfig;

import java.util.HashMap;
import java.util.Map;


public class CloudinaryConfig {

    private static Cloudinary instance;

    public static Cloudinary getConfig() {
    if( instance == null){
        String cloudName = AppConfig.get("cloudinary.cloudName");
        String apiKey = AppConfig.get("cloudinary.apiKey");
        String apiSecret = AppConfig.get("cloudinary.apiSecret");
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        instance = new Cloudinary(config);
    }
    return instance;
    }
}
