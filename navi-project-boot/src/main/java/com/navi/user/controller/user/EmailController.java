package com.navi.user.controller.user;

import com.navi.user.service.user.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class EmailController {
    private final EmailService emailService;

    // 인증코드 전송
    @PostMapping("/send-email")
    public ResponseEntity<?> sendVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        emailService.sendVerificationCode(email);
        return ResponseEntity.ok(Map.of("message", "인증코드를 전송했습니다."));
    }

    // 인증코드 검증
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        boolean result = emailService.verifyCode(email, code);
        if (result) {
            return ResponseEntity.ok(Map.of("verified", true));
        } else {
            return ResponseEntity.badRequest().body(Map.of("verified", false, "message", "인증코드가 올바르지 않습니다."));
        }
    }
}