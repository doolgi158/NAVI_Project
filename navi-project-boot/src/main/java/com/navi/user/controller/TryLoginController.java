package com.navi.user.controller;

import com.navi.user.domain.User;
import com.navi.user.dto.TryLoginDTO;
import com.navi.user.service.TryLoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/login-try")
@RequiredArgsConstructor
public class TryLoginController {
    private final TryLoginService tryLoginService;

    // 로그인 실패
    @PostMapping("/fail/{userNo}")
    public ResponseEntity<TryLoginDTO> loginFail(@PathVariable Long userNo, @RequestBody String ip) {
        User user = User.builder().no(userNo).build();
        TryLoginDTO response = tryLoginService.handleLoginFail(user, ip);
        return ResponseEntity.ok(response);
    }

    // 로그인 성공
    @PostMapping("/success/{userNo}")
    public ResponseEntity<TryLoginDTO> loginSuccess(@PathVariable Long userNo, @RequestBody String ip) {
        User user = User.builder().no(userNo).build();
        TryLoginDTO response = tryLoginService.handleLoginSuccess(user, ip);
        return ResponseEntity.ok(response);
    }
}
