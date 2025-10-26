package com.navi.user.service.user;

import com.navi.common.util.CustomException;
import com.navi.image.repository.ImageRepository;
import com.navi.security.util.JWTUtil;
import com.navi.user.domain.User;
import com.navi.user.domain.Withdraw;
import com.navi.user.dto.request.UserRequestDTO;
import com.navi.user.dto.response.UserResponseDTO;
import com.navi.user.enums.UserRole;
import com.navi.user.enums.UserState;
import com.navi.user.repository.UserRepository;
import com.navi.user.repository.WithdrawRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImageRepository imageRepository;
    private final WithdrawRepository withdrawRepository;
    private final ModelMapper modelMapper;
    private final JWTUtil jwtUtil;

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

        UserResponseDTO dto = UserResponseDTO.from(user);

        // 프로필 이미지 조회
        imageRepository.findByTargetTypeAndTargetId("USER", user.getId())
                .ifPresent(image -> dto.setProfile(image.getPath()));

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkPassword(String token, String currentPw) {
        // JWT에서 사용자 ID 추출
        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        System.out.println("🔹 [checkPassword] userId = " + userId);
        // DB에서 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        System.out.println("🔹 [checkPassword] userPw = " + user.getPw());
        System.out.println("🔹 [checkPassword] matches? " + passwordEncoder.matches(currentPw, user.getPw()));
        // 비밀번호 검증
        return passwordEncoder.matches(currentPw, user.getPw());
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
    @Transactional
    public void withdrawUser(String userId, String reason) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("사용자를 찾을 수 없습니다.", 404, null));

        // 유저 상태를 DELETE로 변경 (탈퇴 대기)
        user = user.toBuilder()
                .userState(UserState.DELETE)
                .build();
        userRepository.save(user);

        // Withdraw 엔티티 생성 및 저장
        Withdraw withdraw = Withdraw.create(user, reason);
        withdrawRepository.save(withdraw);
    }

    @Override
    @Transactional
    public void reactivateUser(String username) {
        User user = userRepository.findByUserId(username)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

        if (user.getUserState() == UserState.NORMAL) {
            return; // 이미 정상 계정이면 그대로 둠
        }

        User updatedUser = user.toBuilder()
                .userState(UserState.NORMAL)
                .build();
        userRepository.save(updatedUser);
    }

    @Override
    public UserResponseDTO signup(UserRequestDTO dto) {
        // 아이디 중복검사
        if (userRepository.existsByIdAndUserState(dto.getId(), UserState.NORMAL)) {
            throw new CustomException("이미 사용 중인 아이디입니다.", 409, dto);
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

    // 1년 이상 활동 없는 NORMAL 유저 → SLEEP 전환
    public void autoSleepInactiveUsers() {
        LocalDateTime threshold = LocalDateTime.now().minusYears(1);
        List<User> targets = userRepository.findNormalUsersInactiveForOneYear(threshold);

        targets.forEach(user -> {
            user.toBuilder().userState(UserState.SLEEP).build();
            log.info("💤 휴면 전환: {}", user.getEmail());
        });

        userRepository.saveAll(targets);
    }

    // 휴면 1년 이상 지난 SLEEP 유저 → DELETE 전환
    public void autoDeleteSleepUsers() {
        LocalDateTime threshold = LocalDateTime.now().minusYears(1);
        List<User> targets = userRepository.findSleepUsersInactiveForAnotherYear(threshold);

        targets.forEach(user -> {
            user.toBuilder().userState(UserState.DELETE).build();
            log.info("🗑️ 자동 탈퇴 처리: {}", user.getEmail());
        });

        userRepository.saveAll(targets);
    }
}
