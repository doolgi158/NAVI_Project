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
    private final TravelRepository travelRepository;
    private final UserRepository userRepository;

    /** ✅ 여행계획 저장 */
    @Override
    public Long savePlan(String userId, TravelPlanRequestDTO dto) {
        log.info("✅ 여행계획 저장 요청: id={}, dto={}", userId, dto);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        LocalTime startTime = (dto.getStartTime() != null) ? dto.getStartTime() : LocalTime.of(10, 0);
        LocalTime endTime = (dto.getEndTime() != null) ? dto.getEndTime() : LocalTime.of(22, 0);

        TravelPlan plan = TravelPlan.builder()
                .user(user)
                .title(dto.getTitle())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .startTime(startTime)
                .endTime(endTime)
                .thumbnailPath(dto.getThumbnailPath())
                .build();

        List<TravelPlanDay> dayList = new ArrayList<>();

        // ✅ 방문지
        if (dto.getTravels() != null) {
            int idx = 0;
            for (TravelPlanRequestDTO.TravelItem t : dto.getTravels()) {
                TravelPlanDay day = TravelPlanDay.builder()
                        .travelPlan(plan)
                        .planTitle(t.getTravelName())
                        .travelId(t.getTravelId())
                        .orderNo(++idx)
                        .dayDate(dto.getStartDate())
                        .startTime(startTime)
                        .endTime(endTime)
                        .build();
                dayList.add(day);
            }
        }

        // ✅ 숙소
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

        plan.setDays(dayList);
        travelPlanRepository.save(plan);
        log.info("✅ 여행 계획 저장 완료: {}", plan.getPlanId());

        return plan.getPlanId();
    }

    /** ✅ 내 여행계획 목록 조회 */
    @Transactional(readOnly = true)
    @Override
    public List<TravelPlan> getMyPlans(String userId) {
        return travelPlanRepository.findByUserId(userId); // ✅ 필드명 기준으로 수정 완료
    }

    /** ✅ 여행계획 수정 */
    @Override
    public void updatePlan(Long planId, String id, TravelPlanRequestDTO dto) {
        log.info("📝 여행계획 수정 요청: planId={}, id={}, dto={}", planId, id, dto);

        TravelPlan plan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 여행계획입니다. id=" + planId));

        if (!plan.getPlanId().equals(planId)) { // ✅ 필드명 기준
            throw new SecurityException("해당 계획을 수정할 권한이 없습니다.");
        }

        plan.updatePlanInfo(dto.getTitle(), dto.getStartDate(), dto.getEndDate(),
                dto.getStartTime(), dto.getEndTime(), dto.getThumbnailPath());

        plan.getDays().clear();
        List<TravelPlanDay> newDays = new ArrayList<>();

        LocalTime startTime = (dto.getStartTime() != null) ? dto.getStartTime() : LocalTime.of(10, 0);
        LocalTime endTime = (dto.getEndTime() != null) ? dto.getEndTime() : LocalTime.of(22, 0);

        if (dto.getTravels() != null) {
            int idx = 0;
            for (TravelPlanRequestDTO.TravelItem t : dto.getTravels()) {
                TravelPlanDay day = TravelPlanDay.builder()
                        .travelPlan(plan)
                        .planTitle(t.getTravelName())
                        .travelId(t.getTravelId())
                        .orderNo(++idx)
                        .dayDate(dto.getStartDate())
                        .startTime(startTime)
                        .endTime(endTime)
                        .build();
                newDays.add(day);
            }
        }

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
                                .orderNo(newDays.size() + 1)
                                .dayDate(stayDate)
                                .startTime(startTime)
                                .endTime(endTime)
                                .stayName(s.getStayName())
                                .build();
                        newDays.add(day);
                    } catch (Exception e) {
                        log.warn("⚠ 숙소 날짜 변환 실패: {}", dateStr);
                    }
                }
            }
        }

        plan.setDays(newDays);
        travelPlanRepository.save(plan);
        log.info("✅ 여행계획 수정 완료: planId={}", planId);
    }

    /** ✅ 여행계획 삭제 */
    @Override
    public void deletePlan(Long planId) {
        TravelPlan plan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 계획입니다."));

        if (plan.getDays() != null) {
            plan.getDays().clear();
        }

        travelPlanRepository.delete(plan);
        log.info("🗑 여행계획 삭제 완료: planId={}", planId);
    }
}
