package com.navi.user.service.admin;

import com.navi.user.dto.admin.AdminDashboardDTO;
import com.navi.user.dto.admin.UserTrendDTO;
import com.navi.user.enums.UserState;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {
    private final UserRepository userRepository;
    private final AdminPaymentDashboardService paymentDashboardService;

    // 유저 통계 계산
    @Override
    public AdminDashboardDTO getUserStatistics(String range) {

        // 전체 집계
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByUserState(UserState.NORMAL);
        long sleepUsers = userRepository.countByUserState(UserState.SLEEP);
        long withdrawUsers = userRepository.countByUserState(UserState.DELETE);

        // 기간 범위 계산 (daily, weekly, monthly)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = switch (range) {
            case "weekly" -> now.minusWeeks(1);
            case "monthly" -> now.minusMonths(1);
            default -> now.minusDays(1);
        };

        // 이전 기간의 총 유저수로 증감률 계산
        long prevTotal = userRepository.count(); // TODO: 추후 기간별 count로 대체 가능
        double changedPct = prevTotal == 0 ? 0.0 :
                ((double) (totalUsers - prevTotal) / prevTotal) * 100.0;

        // 빌더 패턴으로 DTO 구성
        AdminDashboardDTO.Users users = AdminDashboardDTO.Users.builder()
                .total(totalUsers)
                .active(activeUsers)
                .sleep(sleepUsers)
                .withdraw(withdrawUsers)
                .changedPct(changedPct)
                .build();

        return AdminDashboardDTO.builder()
                .users(users)
                .userTrend(findUserTrend(range))
                .travels(new AdminDashboardDTO.Travels(0, 0, 0))
                .accommodations(new AdminDashboardDTO.Accommodations(0, 0))
                .payments(paymentDashboardService.getPaymentStats(range))
                .refunds(new AdminDashboardDTO.Refunds(0, 0))
                .usageTrend(List.of())
                .build();
    }

    // 유저 트렌드 통계 조회 (기간별 가입/탈퇴/활성)
    @Override
    public List<UserTrendDTO> findUserTrend(String range) {
        List<Object[]> result = switch (range) {
            case "daily" -> userRepository.findUserTrendDaily();
            case "weekly" -> userRepository.findUserTrendWeekly();
            default -> userRepository.findUserTrendMonthly();
        };

        return result.stream()
                .map(arr -> UserTrendDTO.builder()
                        .period((String) arr[0])
                        .join(((Number) arr[1]).longValue())
                        .leave(((Number) arr[2]).longValue())
                        .active(((Number) arr[3]).longValue())
                        .build())
                .toList();
    }
}