package org.dawn.backend.controller;

import lombok.RequiredArgsConstructor;
import org.dawn.backend.service.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/cloudinary/upload")
@RequiredArgsConstructor
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    public ResponseEntity<Map> uploadImage(@RequestParam("image") MultipartFile file) {
        return new ResponseEntity<>(this.cloudinaryService.upload(file), HttpStatus.OK);
    }
}
