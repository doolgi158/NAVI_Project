package com.navi.user.controller.user;

import com.navi.common.response.ApiResponse;
import com.navi.user.dto.FindUserIdDTO;
import com.navi.user.service.user.EmailService;
import com.navi.user.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ApiFindIdController {
    private final UserService userService;
    private final EmailService emailService;

    @PostMapping("/find-id")
    public ResponseEntity<?> findUserId(@RequestBody FindUserIdDTO request) {
        String userId = userService.findUserId(request.getName(), request.getEmail());
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "입력하신 정보와 일치하는 계정이 없습니다."));
        }

        return ResponseEntity.ok(Map.of("userId", userId));
    }

    @PostMapping("/find-password")
    public ApiResponse<?> findPassword(@RequestBody Map<String, String> request) {
        String id = request.get("id");
        String email = request.get("email");

        boolean result = emailService.sendTempPassword(id, email);
        if (result) {
            return ApiResponse.success("임시 비밀번호가 이메일로 전송되었습니다.");
        } else {
            return ApiResponse.error("아이디 또는 이메일이 일치하지 않습니다.", 400, null);
        }
    }
}
