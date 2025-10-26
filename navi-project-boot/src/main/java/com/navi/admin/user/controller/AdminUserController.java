package com.navi.admin.user.controller;

import com.navi.admin.user.dto.AdminUserDTO;
import com.navi.admin.user.service.AdminUserService;
import com.navi.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/adm")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;

    // 사용자 + 최근 로그인 이력 조회 (페이징)
    @GetMapping("/users")
    public ApiResponse<?> getUserList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "all") String field
    ) {
        Page<AdminUserDTO> userPage = adminUserService.getPagedUsers(page, size, keyword, field);
        return ApiResponse.success(userPage);
    }

    // 사용자 삭제 (관리자용)
    @DeleteMapping("/{userNo}")
    public ApiResponse<?> deleteUser(@PathVariable Long userNo) {
        adminUserService.deleteUser(userNo);
        return ApiResponse.success("삭제 완료");
    }

    @GetMapping("/userDashboard")
    public ApiResponse<?> getUserDashboard() {
        return ApiResponse.success(adminUserService.getUserDashboard());
    }
}
