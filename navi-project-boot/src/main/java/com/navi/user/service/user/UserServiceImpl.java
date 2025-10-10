package com.navi.user.service.user;

import com.navi.user.domain.User;
import com.navi.user.dto.users.UserRequestDTO;
import com.navi.user.dto.users.UserResponseDTO;
import com.navi.user.enums.UserRole;
import com.navi.user.enums.UserState;
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
    public String findUserId(String name, String email) {
        String n = name == null ? "" : name.trim();
        String e = email == null ? "" : email.trim();

        return userRepository
                .findByNameIgnoreCaseAndEmailIgnoreCase(n, e)
                .map(User::getId) // 로그인 아이디 필드명에 맞게 수정 (예: getUserId)
                .orElse(null);
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

    @Override
    public UserResponseDTO signup(UserRequestDTO dto) {
        // 아이디 중복검사
        if (userRepository.existsById(dto.getId())) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        // 비밀번호 암호화
        String encodedPw = passwordEncoder.encode(dto.getPw());

        // Entity 생성
        User user = User.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .birth(dto.getBirth())
                .email(dto.getEmail())
                .gender(dto.getGender())
                .id(dto.getId())
                .pw(encodedPw)
                .local(dto.getLocal())
                .userState(UserState.NORMAL)
                .build();

        user.addRole(UserRole.USER);

        // 저장
        User saved = userRepository.save(user);

        // 반환 DTO
        return UserResponseDTO.builder()
                .no(saved.getNo())
                .name(saved.getName())
                .phone(saved.getPhone())
                .birth(saved.getBirth())
                .email(saved.getEmail())
                .gender(saved.getGender())
                .id(saved.getId())
                .local(saved.getLocal())
                .userState(saved.getUserState())
                .signUp(saved.getSignUp())
                .build();
    }
}