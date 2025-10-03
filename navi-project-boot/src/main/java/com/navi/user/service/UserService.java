package com.navi.user.service;

import com.navi.user.domain.User;
import com.navi.user.dto.users.UserRequestDTO;
import com.navi.user.dto.users.UserResponseDTO;

import java.util.List;

public interface UserService {
    public Long register(UserRequestDTO userRequestDTO);
    public UserResponseDTO get(Long no);
    public void modify(UserRequestDTO userRequestDTO);
    public void remove(Long no);
    public List<UserResponseDTO> userResponseList();
}
