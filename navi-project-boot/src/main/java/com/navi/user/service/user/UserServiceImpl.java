package com.navi.user.service.user;

import com.navi.user.domain.User;
import com.navi.user.dto.users.UserRequestDTO;
import com.navi.user.dto.users.UserResponseDTO;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Long register(UserRequestDTO userRequestDTO) {
        User user = modelMapper.map(userRequestDTO, User.class);
        User savedUser = userRepository.save(user);

        return savedUser.getNo();
    }

    @Override
    public UserResponseDTO get(Long no) {
        Optional<User> result = userRepository.findById(no);
        User user = result.orElseThrow();
        return modelMapper.map(user, UserResponseDTO.class);
    }

    @Override
    public void modify(UserRequestDTO userRequestDTO) {
        Optional<User> result = userRepository.findById(userRequestDTO.getNo());
        User user = result.orElseThrow();

        User changeData = User.builder()
                .name(user.getName())
                .phone(user.getPhone())
                .birth(user.getBirth())
                .email(user.getEmail())
                .gender(user.getGender())
                .local(user.getLocal())
                .build();
        userRepository.save(changeData);
    }

    @Override
    public void remove(Long no) {
        userRepository.deleteById(no);
    }

    @Override
    public List<UserResponseDTO> userResponseList() {
        List<User> userList = userRepository.findAll();

        return userList.stream().map(user -> UserResponseDTO.builder()
                .no(user.getNo())
                .name(user.getName())
                .phone(user.getPhone())
                .birth(user.getBirth())
                .email(user.getEmail())
                .gender(user.getGender())
                .id(user.getId())
                .local(user.getLocal())
                .userState(user.getUserState())
                .signUp(user.getSignUp())
                .build())
            .toList();
    }
}
