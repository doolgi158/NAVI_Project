package com.navi.user.controller;

import com.navi.user.dto.TryLoginDTO;
import com.navi.user.service.TryLoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/login-try")
@RequiredArgsConstructor
public class TryLoginController {
    private final TryLoginService tryLoginService;

    // 로그인 실패
    @PostMapping("/fail")
    public ResponseEntity<?> recordFail(@RequestParam String ip) {
        try {
            tryLoginService.handleLoginFail(ip);
            return ResponseEntity.ok().body(Map.of("status", "FAIL_RECORDED"));
        } catch (LockedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("status", "LOCKED", "message", e.getMessage()));
        }
    }

    // 로그인 성공
    @PostMapping("/success")
    public ResponseEntity<?> recordSuccess(@RequestParam String ip) {
        tryLoginService.handleLoginSuccess(ip);
        return ResponseEntity.ok(Map.of("status", "SUCCESS_RECORDED"));
    }
}
