package com.navi.image.controller;

import com.navi.common.response.ApiResponse;
import com.navi.image.dto.ImageDTO;
import com.navi.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/images")
public class ImageController {
    private final ImageService imageService;

    // 이미지 업로드 (중복 시 자동 업데이트)
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ImageDTO>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("targetType") String targetType,
            @RequestParam("targetId") String targetId
    ) {
        ImageDTO saved = imageService.uploadImage(file, targetType, targetId);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    // 특정 대상의 모든 이미지 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<ImageDTO>>> getImages(
            @RequestParam("targetType") String targetType,
            @RequestParam("targetId") String targetId
    ) {
        List<ImageDTO> images = imageService.getImagesByTarget(targetType, targetId);
        return ResponseEntity.ok(ApiResponse.success(images));
    }

    // 특정 대상의 이미지 삭제
    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @RequestParam("targetType") String targetType,
            @RequestParam("targetId") String targetId
    ) {
        imageService.deleteImage(targetType, targetId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}