package org.dawn.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Part;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dawn.backend.config.annotation.Post;
import org.dawn.backend.config.response.ResponseObject;
import org.dawn.backend.controller.config.AbstractController;
import org.dawn.backend.service.CloudinaryService;

@RequiredArgsConstructor
@Slf4j
public class CloudinaryController extends AbstractController {

    private final CloudinaryService cloudinaryService;

    @Post("/upload")
    public ResponseObject<?> uploadImage(HttpServletRequest req) {
        try {
            Part filePart = req.getPart("image");
            if(filePart == null){
                return ResponseObject.error(400, "No image part found");
            }

            byte[] fileBytes = filePart.getInputStream().readAllBytes();
            return ResponseObject.success(cloudinaryService.upload(fileBytes));

        } catch (Exception e) {
            log.error("Upload error", e);
            return ResponseObject.error(500, e.getMessage());
        }
    }
}
