package org.dawn.backend.controller.system;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.service.system.CloudinaryService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/cloudinary")
@RequiredArgsConstructor
@Slf4j
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseObject<?> uploadImage(@RequestParam("image") MultipartFile file) {
        return ResponseObject.success(cloudinaryService.upload(file));
    }
}
