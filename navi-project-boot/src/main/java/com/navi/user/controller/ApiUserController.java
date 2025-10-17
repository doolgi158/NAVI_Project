package com.navi.user.controller;

import com.navi.common.response.ApiResponse;
import com.navi.image.service.ImageService;
import com.navi.user.dto.users.UserRequestDTO;
import com.navi.user.dto.users.UserResponseDTO;
import com.navi.user.dto.users.UserSecurityDTO;
import com.navi.user.repository.UserRepository;
import com.navi.user.security.util.LoginRequestUtil;
import com.navi.user.service.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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

    @PostMapping("/check-password")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkPassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> payload) {

        boolean isMatch = userService.checkPassword(token, payload.get("currentPw"));
        Map<String, Boolean> result = new HashMap<>();
        result.put("valid", isMatch);

        if (!isMatch) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("비밀번호가 일치하지 않습니다.", 401, result));
        }

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> payload) {
        userService.changePassword(token, payload.get("currentPw"), payload.get("newPassword"));
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/delete")
    public ResponseEntity<ApiResponse<String>> withdrawUser( @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        // JWT에서 id 추출
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserSecurityDTO principal = (UserSecurityDTO) auth.getPrincipal();

        String username = principal.getId();
        String reason = body.get("reason");

        userService.withdrawUser(username, reason);

        return ResponseEntity.ok(ApiResponse.success("회원 탈퇴가 완료되었습니다."));
    }

    // 휴면계정 복구 (NORMAL 전환)
    @PostMapping("/reactivate")
    public ResponseEntity<ApiResponse<String>> reactivateUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        userService.reactivateUser(username);

        return ResponseEntity.ok(ApiResponse.success("계정이 정상 상태로 전환되었습니다."));
    }
}
