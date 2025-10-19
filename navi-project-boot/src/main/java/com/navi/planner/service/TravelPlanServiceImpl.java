package com.navi.planner.service;

import com.navi.planner.domain.TravelPlan;
import com.navi.planner.domain.TravelPlanDay;
import com.navi.planner.dto.TravelPlanRequestDTO;
import com.navi.planner.repository.TravelPlanRepository;
import com.navi.travel.repository.TravelRepository;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TravelPlanServiceImpl implements TravelPlanService {

    private final TravelPlanRepository travelPlanRepository;
    private final TravelRepository travelRepository; // 지금은 사용 안 하지만 향후 검증/조인 시 활용
    private final UserRepository userRepository;

    /** ✅ 여행 계획 저장 (userId = 문자열 아이디 기반) */
    @Override
    public Long savePlan(String userId, TravelPlanRequestDTO dto) {
        log.info("✅ 여행계획 저장 요청: userId={}, dto={}", userId, dto);

        // 🔴 기존: findById(userId) -> PK(Long)로 찾으려다 실패
        // ✅ 수정: user_id(문자열)로 조회
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다. userId=" + userId));

        LocalTime startTime = (dto.getStartTime() != null) ? dto.getStartTime() : LocalTime.of(10, 0);
        LocalTime endTime   = (dto.getEndTime() != null)   ? dto.getEndTime()   : LocalTime.of(22, 0);

        TravelPlan plan = TravelPlan.builder()
                .user(user)
                .title(dto.getTitle())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .startTime(startTime)
                .endTime(endTime)
                .thumbnailPath(dto.getThumbnailPath())
                .build();

        // Day 데이터 설정
        List<TravelPlanDay> dayList = new ArrayList<>();

        // ⓐ 방문지(travels) -> startDate에 순서대로
        if (dto.getTravels() != null) {
            int idx = 0;
            for (TravelPlanRequestDTO.TravelItem t : dto.getTravels()) {
                TravelPlanDay day = TravelPlanDay.builder()
                        .travelPlan(plan)
                        .planTitle(dto.getTitle())
                        .planTitle(t.getTravelName())
                        .travelId(t.getTravelId()) // TRAVEL.TRAVEL_ID
                        .orderNo(++idx)
                        .dayDate(dto.getStartDate())
                        .startTime(startTime)
                        .endTime(endTime)
                        .build();
                dayList.add(day);
            }
        }

        // ⓑ 숙소(stays) -> 전달받은 날짜 리스트("MM/dd")를 yyyy-MM-dd로 환산해 저장
        if (dto.getStays() != null) {
            for (TravelPlanRequestDTO.StayItem s : dto.getStays()) {
                if (s.getDates() == null) continue;
                for (String dateStr : s.getDates()) {
                    try {
                        String[] parts = dateStr.split("/");
                        LocalDate base = dto.getStartDate();
                        LocalDate stayDate = LocalDate.of(
                                base.getYear(),
                                Integer.parseInt(parts[0]),
                                Integer.parseInt(parts[1])
                        );

                        TravelPlanDay day = TravelPlanDay.builder()
                                .travelPlan(plan)
                                .planTitle(s.getStayName())
                                .orderNo(dayList.size() + 1)
                                .dayDate(stayDate)
                                .startTime(startTime)
                                .endTime(endTime)
                                .stayName(s.getStayName())
                                .build();
                        dayList.add(day);
                    } catch (Exception e) {
                        log.warn("⚠ 숙소 날짜 변환 실패: {}", dateStr);
                    }
                }
            }
        }

        plan.setDays(dayList);      // 양방향 연결 보장
        travelPlanRepository.save(plan);

        log.info("✅ 여행 계획 저장 완료: {}", plan.getId());
        return plan.getId();
    }

    /** ✅ 내 계획 리스트(목록) 조회: days 포함(fetch) */
    @Transactional(readOnly = true)
    @Override
    public List<TravelPlan> getMyPlans(String userId) {
        // fetch join으로 days까지 함께 로딩
        return travelPlanRepository.findAllWithDaysByUserId(userId);
    }

    /** (옵션) 단건 상세 조회가 필요하다면 */
    @Transactional(readOnly = true)
    public TravelPlan getPlanDetail(Long id) {
        return travelPlanRepository.findWithDaysById(id);
    }
}
