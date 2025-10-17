package com.navi.planner.Service;

import com.navi.planner.domain.TravelPlan;
import com.navi.planner.domain.TravelPlanDay;
import com.navi.planner.dto.TravelPlanRequestDTO;
import com.navi.planner.repository.TravelPlanRepository;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TravelPlanServiceImpl implements TravelPlanService {

    private final TravelPlanRepository travelPlanRepository;
    private final UserRepository userRepository;

    @Transactional
    @Override
    public TravelPlan savePlan(long userNo, TravelPlanRequestDTO dto) {
        User user = userRepository.findById(userNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        TravelPlan plan = TravelPlan.builder()
                .user(user)
                .title(dto.getTitle())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .summary(dto.getSummary())
                .thumbnailPath(dto.getThumbnailPath())
                .build();

        int order = 1;
        for (TravelPlanRequestDTO.PlanItem item : dto.getPlanItems()) {
            TravelPlanDay day = TravelPlanDay.builder()
                    .travelPlan(plan)
                    .dayDate(item.getDayDate())
                    .orderNo(order++)
                    .planTitle(item.getPlanTitle())
                    .travelContentId(item.getTravelContentId())
                    .stayName(item.getStayName())
                    .startTime(item.getStartTime() != null ? item.getStartTime() : LocalTime.of(10, 0))
                    .endTime(item.getEndTime() != null ? item.getEndTime() : LocalTime.of(22, 0))
                    .build();
            plan.getDays().add(day);
        }

        // 대표사진 자동 세팅
        if (plan.getThumbnailPath() == null && !plan.getDays().isEmpty()) {
            plan.setThumbnailPath("/images/travel/" + plan.getDays().get(0).getTravelContentId() + ".jpg");
        }

        // summary 자동 생성
        if (plan.getSummary() == null || plan.getSummary().isBlank()) {
            String joined = plan.getDays().stream()
                    .limit(3)
                    .map(TravelPlanDay::getPlanTitle)
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("여행 일정");
            plan.setSummary(joined + " 등");
        }

        return travelPlanRepository.save(plan);
    }

    @Override
    public List<TravelPlan> getMyPlans(long userNo) {
        return travelPlanRepository.findByUserNo(userNo);
    }
}
