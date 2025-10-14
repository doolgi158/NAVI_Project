package com.navi.user.controller;

import com.navi.common.response.ApiResponse;
import com.navi.user.domain.History;
import com.navi.user.domain.User;
import com.navi.user.dto.admin.AdminUserDTO;
import com.navi.user.enums.UserState;
import com.navi.user.repository.HistoryRepository;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/adm/users")
@RequiredArgsConstructor
public class ApiAdminUserController {
    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;

    private final DateTimeFormatter SIGNUP_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    private final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

    // 사용자 + 최근 로그인 이력 조회 (페이징)
//    @GetMapping
//    public ApiResponse<?> getUserList(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size,
//            @RequestParam(required = false) String keyword,
//            @RequestParam(defaultValue = "all") String field
//    ) {
//        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "no"));
//        Page<User> userPage;
//
//        // 검색 조건 분기
//        if (keyword != null && !keyword.isEmpty()) {
//            switch (field) {
//                case "userId":
//                    userPage = userRepository.findByIdContainingIgnoreCase(keyword, pageable);
//                    break;
//                case "userName":
//                    userPage = userRepository.findByNameContainingIgnoreCase(keyword, pageable);
//                    break;
//                case "userEmail":
//                    userPage = userRepository.findByEmailContainingIgnoreCase(keyword, pageable);
//                    break;
//                case "userPhone":
//                    userPage = userRepository.findByPhoneContainingIgnoreCase(keyword, pageable);
//                    break;
//                case "userLocal":
//                    userPage = userRepository.findByLocal(keyword.equals("내국인") ? "L" : "F", pageable);
//                    break;
//                case "userState":
//                    try {
//                        UserState state = UserState.valueOf(keyword.toUpperCase());
//                        userPage = userRepository.findByUserState(state, pageable);
//                    } catch (IllegalArgumentException e) {
//                        userPage = Page.empty(pageable);
//                    }
//                    break;
//                case "userSignup":
//                    userPage = userRepository.findBySignUpContaining(keyword, pageable);
//                    break;
//                case "historyIp":
//                    // history 검색은 조인 필요 → 예시로 전체 불러와서 필터링
//                    List<User> allUsers = userRepository.findAll();
//                    List<User> filtered = allUsers.stream()
//                            .filter(u -> historyRepository.findTopByUserOrderByLoginDesc(u)
//                                    .map(h -> h.getIp().contains(keyword))
//                                    .orElse(false))
//                            .collect(Collectors.toList());
//                    userPage = new PageImpl<>(filtered, pageable, filtered.size());
//                    break;
//                default:
//                    userPage = userRepository.findByNameContainingIgnoreCaseOrIdContainingIgnoreCase(keyword, keyword, pageable);
//            }
//        } else {
//            userPage = userRepository.findAll(pageable);
//        }
//
//        // DTO 매핑
//        List<AdminUserDTO> list = userPage.getContent().stream().map(user -> {
//            History recent = historyRepository.findTopByUserOrderByLoginDesc(user).orElse(null);
//
//            String formattedSignUp = user.getSignUp() != null
//                    ? user.getSignUp().format(SIGNUP_FORMATTER)
//                    : "-";
//
//            String formattedLogin = (recent != null && recent.getLogin() != null)
//                    ? recent.getLogin().format(DATE_TIME_FORMATTER)
//                    : "-";
//
//            String formattedLogout = (recent != null && recent.getLogout() != null)
//                    ? recent.getLogout().format(DATE_TIME_FORMATTER)
//                    : "-";
//
//            return AdminUserDTO.builder()
//                    .userNo(user.getNo())
//                    .userId(user.getId())
//                    .userName(user.getName())
//                    .userGender(user.getGender())
//                    .userBirth(user.getBirth())
//                    .userEmail(user.getEmail())
//                    .userPhone(user.getPhone())
//                    .userLocal(user.getLocal().equals("L") ? "내국인" : "외국인")
//                    .userSignup(formattedSignUp)
//                    .userState(user.getUserState().toString())
//                    .historyIp(recent != null ? recent.getIp() : "-")
//                    .historyLogin(formattedLogin)
//                    .historyLogout(formattedLogout)
//                    .build();
//        }).collect(Collectors.toList());
//
//        return ApiResponse.success(new PageImpl<>(list, pageable, userPage.getTotalElements()));
//    }

    // 사용자 삭제 (관리자용)
    @DeleteMapping("/{userNo}")
    public ApiResponse<?> deleteUser(@PathVariable Long userNo) {
        userRepository.deleteById(userNo);
        return ApiResponse.success("삭제 완료");
    }
}
