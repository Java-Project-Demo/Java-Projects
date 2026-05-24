package org.dawn.backend.service.system;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.constant.system.Message;
import org.dawn.backend.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;


@RequiredArgsConstructor
@Slf4j
@Service
public class CloudinaryService {

    @Value("${cloudinary.folderName}")
    private String folderName;

    private final Cloudinary cloudinary;

    public Map upload(MultipartFile file) {
        try {
            Map params = ObjectUtils.asMap(
                    "folder", folderName,
                    "resource_type", "auto"
            );

            return this.cloudinary.uploader().upload(file.getBytes(), params);
        } catch (IOException e) {
            log.error("Cloudinary update failed ", e);
            throw new ApiException(Message.Exception.IMAGE_UPLOAD_FAILED);
        }
    }

}
