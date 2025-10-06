package com.navi.user.controller;

import com.navi.user.service.TryLoginService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
}
