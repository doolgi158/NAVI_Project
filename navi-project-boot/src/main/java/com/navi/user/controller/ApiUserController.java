package com.navi.user.controller;

import com.navi.common.response.ApiResponse;
import com.navi.image.domain.Image;
import com.navi.image.dto.ImageDTO;
import com.navi.image.service.ImageService;
import com.navi.user.dto.users.UserRequestDTO;
import com.navi.user.dto.users.UserResponseDTO;
import com.navi.user.dto.users.UserSecurityDTO;
import com.navi.user.repository.UserRepository;
import com.navi.user.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class ApiUserController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final ImageService imageService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponseDTO>> signup(@RequestBody UserRequestDTO request) {
        UserResponseDTO response = userService.signup(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/check-id")
    public ResponseEntity<?> checkDuplicateId(@RequestParam String id) {
        boolean exists = userRepository.existsById(id);
        return ResponseEntity.ok(Map.of("available", !exists));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getMyInfo(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(ApiResponse.success(userService.getMyInfo(token)));
    }

    // 회원 정보 수정
    @PutMapping("/me")
    public ApiResponse<UserResponseDTO> updateUserInfo(
            @AuthenticationPrincipal com.navi.user.dto.users.UserSecurityDTO loginUser,
            @RequestBody UserRequestDTO dto
    ) {
        UserResponseDTO updated = userService.updateUserInfo(loginUser.getUsername(), dto);
        return ApiResponse.success(updated);
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> payload) {
        userService.changePassword(token, payload.get("oldPassword"), payload.get("newPassword"));
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
