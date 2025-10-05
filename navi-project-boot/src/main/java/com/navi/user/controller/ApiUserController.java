package com.navi.user.controller;

import com.navi.user.dto.users.UserRequestDTO;
import com.navi.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/Users")
public class ApiUserController {
    UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String userId, @RequestParam String userPw){
        UserRequestDTO user = userService.login(userId, userPw);

        if (user != null) {
            return ResponseEntity.ok(user); // ✅ 로그인 성공
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("아이디 또는 비밀번호가 잘못되었습니다."); // ❌ 실패
        }
    }
}
