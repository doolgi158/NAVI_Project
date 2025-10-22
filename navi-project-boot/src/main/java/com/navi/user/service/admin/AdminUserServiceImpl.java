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

    /**
     * ✅ 유저 통계 계산
     */
    public AdminDashboardDTO getUserStatistics() {
        // 실데이터 조회
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByUserState(UserState.NORMAL);
        long sleepUsers = userRepository.countByUserState(UserState.SLEEP);
        long withdrawUsers = userRepository.countByUserState(UserState.DELETE);

        // 나머지 영역은 빈 데이터로 전달 (프론트 렌더링 오류 방지)
        return AdminDashboardDTO.builder()
                .users(AdminDashboardDTO.Users.builder()
                        .total(totalUsers)
                        .active(activeUsers)
                        .sleep(sleepUsers)
                        .withdraw(withdrawUsers)
                        .build())
                .userTrend(findMonthlyUserTrend())

                // ✅ 아직 미구현 필드는 전부 빈 객체로 초기화
                .travels(new AdminDashboardDTO.Travels(0, 0, 0))
                .accommodations(new AdminDashboardDTO.Accommodations(0, 0))
                .payments(paymentDashboardService.getPaymentStats())
                .refunds(new AdminDashboardDTO.Refunds(0, 0))
                .cs(new AdminDashboardDTO.Cs(0))
                .usageTrend(List.of())
                .build();
    }

    @Override
    public List<UserTrendDTO> findMonthlyUserTrend() {
        List<Object[]> result = userRepository.findMonthlyUserTrendRaw();

        return result.stream()
                .map(arr -> UserTrendDTO.builder()
                        .month((String) arr[0])
                        .active(((Number) arr[1]).longValue())
                        .leave(((Number) arr[2]).longValue())
                        .join(((Number) arr[3]).longValue())
                        .build())
                .toList();
    }
}