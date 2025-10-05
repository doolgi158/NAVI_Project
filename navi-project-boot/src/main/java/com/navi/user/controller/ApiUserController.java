package com.navi.user.controller;

import com.navi.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/Users")
public class ApiUserController {
    UserService userService;
}
