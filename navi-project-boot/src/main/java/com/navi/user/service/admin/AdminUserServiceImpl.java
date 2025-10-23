package com.navi.user.service.admin;

import com.navi.user.dto.admin.AdminDashboardDTO;
import com.navi.user.dto.admin.UserTrendDTO;
import com.navi.user.enums.UserState;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {
    private final UserRepository userRepository;
    private final AdminPaymentDashboardService paymentDashboardService;

    // 유저 통계 계산
    public AdminDashboardDTO getUserStatistics(String range) {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByUserState(UserState.NORMAL);
        long sleepUsers = userRepository.countByUserState(UserState.SLEEP);
        long withdrawUsers = userRepository.countByUserState(UserState.DELETE);

        return AdminDashboardDTO.builder()
                .users(new AdminDashboardDTO.Users(totalUsers, activeUsers, sleepUsers, withdrawUsers, 0.0))
                .userTrend(findUserTrend(range))
                .travels(new AdminDashboardDTO.Travels(0, 0, 0))
                .accommodations(new AdminDashboardDTO.Accommodations(0, 0))
                .payments(paymentDashboardService.getPaymentStats())
                .refunds(new AdminDashboardDTO.Refunds(0, 0))
                .usageTrend(List.of())
                .build();
    }

    @Override
    public List<UserTrendDTO> findUserTrend(String range) {
        List<Object[]> result = userRepository.findUserTrendRaw(range);
        return result.stream()
                .map(arr -> UserTrendDTO.builder()
                        .period((String) arr[0])
                        .active(((Number) arr[1]).longValue())
                        .leave(((Number) arr[2]).longValue())
                        .join(((Number) arr[3]).longValue())
                        .build())
                .toList();
    }
}