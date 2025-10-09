package com.navi.user.controller;

import com.navi.user.dto.FindUserIdDTO;
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

    @PostMapping("/find-id")
    public ResponseEntity<?> findUserId(@RequestBody FindUserIdDTO request) {
        String userId = userService.findUserId(request.getName(), request.getEmail());
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "입력하신 정보와 일치하는 계정이 없습니다."));
        }

        return ResponseEntity.ok(Map.of("userId", userId));
    }
}
