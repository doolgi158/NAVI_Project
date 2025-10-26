package com.navi.admin.user.service;

import com.navi.admin.user.dto.AdminUserDTO;
import org.springframework.data.domain.Page;

import java.util.Map;

public interface AdminUserService {
    Page<AdminUserDTO> getPagedUsers(int page, int size, String keyword, String field);

    void deleteUser(Long userNo);

    Map<String, Object> getUserDashboard();
}
