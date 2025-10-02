package com.navi.user.service;

import com.navi.user.dto.users.UserSecurityDTO;

import java.util.List;

public interface UserService {
    public List<UserSecurityDTO> userList();
}
