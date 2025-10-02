package com.navi.user.service;

import com.navi.user.domain.User;
import com.navi.user.dto.UserDTO;

import java.util.List;

public interface UserService {
    public List<UserDTO> userList(User user);
}
