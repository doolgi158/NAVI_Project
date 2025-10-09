package com.navi.user.controller;

import com.navi.user.dto.users.UserResponseDTO;
import com.navi.user.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adm")
public class ApiAdminUserController {
    private final UserService userService;

    @GetMapping("/users")
    public String userList(UserResponseDTO userResponseDTO, Model model) {
        List<UserResponseDTO> userList = userService.userResponseList();
        model.addAttribute("userLilst", userList);

        return userList.toString();
    }
}
