package com.navi.user.service.user;

import com.navi.image.repository.ImageRepository;
import com.navi.user.domain.User;
import com.navi.user.dto.users.UserRequestDTO;
import com.navi.user.dto.users.UserResponseDTO;
import com.navi.user.enums.UserRole;
import com.navi.user.enums.UserState;
import com.navi.user.repository.UserRepository;
import com.navi.user.security.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService{
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;
    private final ImageRepository imageRepository;

    private static final String PROFILE_DIR = "C:/NAVI_Project/serverImage";

    @Override
    public UserResponseDTO get(Long no) {
        User user = userRepository.findById(no)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return UserResponseDTO.from(user);
    }

    @Override
    public String findUserId(String name, String email) {
        return userRepository.findByNameIgnoreCaseAndEmailIgnoreCase(
                name == null ? "" : name.trim(),
                email == null ? "" : email.trim()
        ).map(User::getId).orElse(null);
    }

    @Override
    public UserResponseDTO getMyInfo(String token) {
        var claims = jwtUtil.validateAndParse(token.replace("Bearer ", ""));
        String id = claims.getId();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return UserResponseDTO.from(user);
    }

    @Override
    @Transactional
    public void changePassword(String token, String oldPw, String newPw) {
        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(oldPw, user.getPw())) {
            throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
        }

        userRepository.save(user.changePassword(passwordEncoder.encode(newPw)));
    }

    @Override
    public UserResponseDTO updateUserInfo(String username, UserRequestDTO dto) {
        User user = userRepository.findById(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 수정 가능한 필드 업데이트
        user = user.toBuilder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .birth(dto.getBirth())
                .email(dto.getEmail())
                .gender(dto.getGender())
                .local(dto.getLocal())
                .build();

        User saved = userRepository.save(user);

        // DTO 반환
        return UserResponseDTO.from(saved);
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
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

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
                .signUp(saved.getSignUp() != null ? saved.getSignUp().format(formatter) : null)
                .build();
    }
}
