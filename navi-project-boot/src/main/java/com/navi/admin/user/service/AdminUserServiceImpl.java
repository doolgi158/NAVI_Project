package com.navi.admin.user.service;

import com.navi.admin.payment.service.AdminPaymentDashboardService;
import com.navi.admin.user.dto.AdminUserDTO;
import com.navi.admin.user.repository.AdminUserRepository;
import com.navi.admin.user.repository.HistoryRepository;
import com.navi.user.domain.History;
import com.navi.user.domain.User;
import com.navi.user.enums.UserState;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;
    private final AdminPaymentDashboardService paymentDashboardService;
    private final AdminUserRepository AdminUserRepository;

    @Override
    public Page<AdminUserDTO> getPagedUsers(int page, int size, String keyword, String field) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "no"));

        // 검색어가 있는 경우만 필터링
        Page<User> userPage;
        if (keyword != null && !keyword.trim().isEmpty() && !"all".equalsIgnoreCase(field)) {
            userPage = getFilteredUsers(keyword.trim(), field, pageable);
        } else {
            userPage = AdminUserRepository.findAllWithRoles(pageable);
        }

        // 로그인 이력 batch 조회로 N+1 방지
        List<Long> userNos = userPage.getContent().stream().map(User::getNo).toList();
        Map<Long, History> recentHistoryMap =
                historyRepository.findRecentHistoriesByUserNos(userNos)
                        .stream()
                        .collect(Collectors.toMap(h -> h.getUser().getNo(), h -> h));

        List<AdminUserDTO> list = userPage.getContent().stream()
                .map(user -> AdminUserDTO.of(user, recentHistoryMap.get(user.getNo())))
                .toList();

        return new PageImpl<>(list, pageable, userPage.getTotalElements());
    }

    private Page<User> getFilteredUsers(String keyword, String field, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) return userRepository.findAll(pageable);
        return switch (field) {
            case "userId" -> userRepository.findByIdContainingIgnoreCase(keyword, pageable);
            case "userName" -> userRepository.findByNameContainingIgnoreCase(keyword, pageable);
            case "userEmail" -> userRepository.findByEmailContainingIgnoreCase(keyword, pageable);
            case "userPhone" -> userRepository.findByPhoneContainingIgnoreCase(keyword, pageable);
            case "userLocal" -> userRepository.findByLocal(keyword.equals("내국인") ? "L" : "F", pageable);
            case "userState" -> {
                try {
                    yield userRepository.findByUserState(UserState.valueOf(keyword.toUpperCase()), pageable);
                } catch (IllegalArgumentException e) {
                    yield Page.empty(pageable);
                }
            }
            case "userSignup" -> userRepository.findBySignUpContaining(keyword, pageable);
            default ->
                    userRepository.findByNameContainingIgnoreCaseOrIdContainingIgnoreCase(keyword, keyword, pageable);
        };
    }

    @Override
    public void deleteUser(Long userNo) {
        userRepository.deleteById(userNo);
    }

    @Override
    public Map<String, Object> getUserDashboard() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);

        Map<String, Object> map = new HashMap<>();
        map.put("total", AdminUserRepository.countAllUsers());
        map.put("recentJoin", AdminUserRepository.countRecentJoin(cutoff));
        map.put("recentLeave", AdminUserRepository.countRecentLeave(cutoff));
        map.put("activeUsers", AdminUserRepository.countActiveUsers());
        return map;
    }
}