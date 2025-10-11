package com.navi.user.controller;

import com.navi.common.response.ApiResponse;
import com.navi.user.dto.users.UserRequestDTO;
import com.navi.user.dto.users.UserResponseDTO;
import com.navi.user.repository.UserRepository;
import com.navi.user.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class ApiUserController {
    private final UserService userService;
    private final UserRepository userRepository;

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

    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<String>> uploadProfile(
            @RequestHeader("Authorization") String token,
            @RequestParam("file") MultipartFile file) {
        String url = userService.uploadProfile(token, file);
        return ResponseEntity.ok(ApiResponse.success(url));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(@RequestHeader("Authorization") String token) {
        userService.deleteProfile(token);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> payload) {
        userService.changePassword(token, payload.get("oldPassword"), payload.get("newPassword"));
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
