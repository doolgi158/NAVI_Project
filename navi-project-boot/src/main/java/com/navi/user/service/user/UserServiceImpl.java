package com.navi.user.service.user;

import com.navi.image.domain.Image;
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
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
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
        Image profile = imageRepository.findByUser_No(no).orElse(null);
        return UserResponseDTO.from(user, profile);
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

        Image profile = imageRepository.findByUser_No(user.getNo()).orElse(null);
        return UserResponseDTO.from(user, profile);
    }

    @Override
    @Transactional
    public String uploadProfile(String token, MultipartFile file) {
        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        try {
            Files.createDirectories(Paths.get(PROFILE_DIR));
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(PROFILE_DIR, fileName);
            file.transferTo(filePath.toFile());
            String url = "/uploads/profile/" + fileName;

            // 기존 이미지 삭제
            imageRepository.findByUser_No(user.getNo()).ifPresent(imageRepository::delete);

            // 새 이미지 저장
            Image image = Image.builder()
                    .user(user)
                    .path(url)
                    .build();

            imageRepository.save(image);
            return url;
        } catch (Exception e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }
    }

    @Override
    @Transactional
    public void deleteProfile(String token) {
        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        imageRepository.deleteByUser_No(user.getNo());
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
