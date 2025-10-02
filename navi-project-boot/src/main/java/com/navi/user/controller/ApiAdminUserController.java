package com.navi.user.controller;

import com.navi.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm")
public class ApiAdminUserController {
    private final UserService userService;

}
