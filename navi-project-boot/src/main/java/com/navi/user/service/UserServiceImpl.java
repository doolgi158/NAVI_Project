package com.navi.user.service;

import com.navi.user.domain.User;
import com.navi.user.dto.UserDTO;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{
    public final UserRepository userRepository;

    @Override
    public List<UserDTO> userList(User user) {
        return List.of();
    }
}
