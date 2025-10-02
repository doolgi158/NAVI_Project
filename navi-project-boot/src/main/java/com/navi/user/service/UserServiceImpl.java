package com.navi.user.service;

import com.navi.user.dto.users.UserSecurityDTO;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{
    public final UserRepository userRepository;

    @Override
    public List<UserSecurityDTO> userList() {
        return List.of();
    }
}
