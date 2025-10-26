package com.navi.planner.service;

import com.navi.planner.domain.TravelPlan;
import com.navi.planner.domain.TravelPlanDay;
import com.navi.planner.domain.TravelPlanItem;
import com.navi.planner.dto.TravelPlanListResponseDTO;
import com.navi.planner.dto.TravelPlanRequestDTO;
import com.navi.planner.repository.TravelPlanItemRepository;
import com.navi.planner.repository.TravelPlanRepository;
import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.repository.AccRepository;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TravelPlanServiceImpl implements TravelPlanService {

    private final TravelPlanRepository travelPlanRepository;
    private final TravelPlanItemRepository travelPlanItemRepository;
    private final UserRepository userRepository;
    private final AccRepository accRepository;
    private final EntityManager em;

    /** ✅ 여행계획 저장 */
    @Override
    public Long savePlan(String userId, TravelPlanRequestDTO dto) {
        log.info("✳️ 여행계획 저장 요청: userId={}, title={}", userId, dto.getTitle());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        // 1️⃣ TravelPlan 생성
        TravelPlan plan = TravelPlan.builder()
                .user(user)
                .title(dto.getTitle())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .thumbnailPath(dto.getThumbnailPath())
                .build();

        // 2️⃣ days + items 매핑
        if (dto.getDays() != null) {
            var dayEntities = dto.getDays().stream()
                    .map(dayDto -> {
                        TravelPlanDay day = TravelPlanDay.builder()
                                .travelPlan(plan)
                                .dayDate(dayDto.getDayDate())
                                .orderNo(dayDto.getOrderNo())
                                .build();

                        if (dayDto.getItems() != null) {
                            var itemEntities = dayDto.getItems().stream()
                                    .map(itemDto -> {
                                        Double lat = itemDto.getLat();
                                        Double lng = itemDto.getLng();

                                        // ✅ 숙소(stay) 좌표 자동 보정
                                        if ("stay".equalsIgnoreCase(itemDto.getType())
                                                && (lat == null || lng == null)
                                                && itemDto.getStayId() != null) {
                                            try {
                                                Acc acc = accRepository.findById(itemDto.getStayId()).orElse(null);
                                                if (acc != null && acc.getMapy() != null && acc.getMapx() != null) {
                                                    lat = acc.getMapy().doubleValue(); // 위도
                                                    lng = acc.getMapx().doubleValue(); // 경도

                                                } else {
                                                    log.warn("⚠️ 숙소 좌표 보정 실패: stayId={} (좌표 없음)", itemDto.getStayId());
                                                }
                                            } catch (Exception e) {
                                                log.error("숙소 좌표 조회 중 오류 발생", e);
                                            }
                                        }

                                        return TravelPlanItem.builder()
                                                .day(day)
                                                .title(itemDto.getTitle())
                                                .type(itemDto.getType())
                                                .travelId(itemDto.getTravelId())
                                                .stayId(itemDto.getStayId())
                                                .stayName(itemDto.getStayName())
                                                .lat(lat)
                                                .lng(lng)
                                                .img(itemDto.getImg())
                                                .startTime(itemDto.getStartTime())
                                                .endTime(itemDto.getEndTime())
                                                .build();
                                    })
                                    .collect(Collectors.toCollection(LinkedHashSet::new));
                            day.setItems(itemEntities);
                        }
                        return day;
                    })
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            plan.setDays(dayEntities);
        }

        // ✅ 썸네일 자동 보정
        if (plan.getThumbnailPath() == null || plan.getThumbnailPath().isBlank()) {
            plan.setThumbnailPath(
                    dto.getDays().stream()
                            .flatMap(d -> d.getItems().stream())
                            .map(TravelPlanRequestDTO.ItemRequestDTO::getImg)
                            .filter(Objects::nonNull)
                            .filter(s -> !s.isBlank())
                            .findFirst()
                            .orElse("https://placehold.co/400x300?text=Travel+Plan")
            );
        }

        TravelPlan saved = travelPlanRepository.save(plan);
        em.flush(); // ✅ 즉시 DB 반영
        log.info("✅ 여행계획 저장 완료: planId={}", saved.getPlanId());
        return saved.getPlanId();
    }

    /** ✅ 내 여행계획 목록 */
    @Override
    @Transactional(readOnly = true)
    public List<TravelPlanListResponseDTO> getMyPlans(String userId) {
        log.info("📋 내 여행계획 목록 조회: userId={}", userId);

        List<TravelPlan> plans = travelPlanRepository.findAllWithDaysAndItemsByUserId(userId);
        return plans.stream()
                .map(TravelPlanListResponseDTO::fromEntity)
                .sorted(Comparator.comparing(TravelPlanListResponseDTO::getStartDate))
                .toList();
    }

    /** ✅ 여행계획 수정 */
    @Override
    public void updatePlan(Long planId, String userId, TravelPlanRequestDTO dto) {

        TravelPlan plan = travelPlanRepository.findByIdWithDaysAndItems(planId)
                .orElseThrow(() -> new EntityNotFoundException("해당 여행계획을 찾을 수 없습니다."));

        if (!plan.getUser().getId().equals(userId))
            throw new IllegalArgumentException("본인의 여행계획만 수정할 수 있습니다.");

        plan.updatePlanInfo(
                dto.getTitle(),
                dto.getStartDate(),
                dto.getEndDate(),
                dto.getStartTime(),
                dto.getEndTime(),
                dto.getThumbnailPath()
        );

        // ✅ 기존 일정과 아이템 완전 삭제 (DB 반영 포함)
        if (plan.getDays() != null && !plan.getDays().isEmpty()) {
            plan.getDays().forEach(day -> {
                if (day.getItems() != null && !day.getItems().isEmpty()) {
                    day.getItems().clear(); // item clear
                }
            });
            plan.getDays().clear();
            em.flush(); // ✅ 즉시 삭제 반영
        }

        // ✅ 새 일정 추가
        if (dto.getDays() != null) {
            dto.getDays().forEach(dayDto -> {
                TravelPlanDay day = TravelPlanDay.builder()
                        .travelPlan(plan)
                        .dayDate(dayDto.getDayDate())
                        .orderNo(dayDto.getOrderNo())
                        .build();

                if (dayDto.getItems() != null) {
                    var itemEntities = dayDto.getItems().stream()
                            .filter(itemDto -> !itemDto.isDeleted())
                            .map(itemDto -> {
                                Double lat = itemDto.getLat();
                                Double lng = itemDto.getLng();

                                // ✅ 숙소(stay) 좌표 자동 보정
                                if ("stay".equalsIgnoreCase(itemDto.getType())
                                        && (lat == null || lng == null)
                                        && itemDto.getStayId() != null) {
                                    try {
                                        Acc acc = accRepository.findById(itemDto.getStayId()).orElse(null);
                                        if (acc != null && acc.getMapy() != null && acc.getMapx() != null) {
                                            lat = acc.getMapy().doubleValue();
                                            lng = acc.getMapx().doubleValue();
                                            if (lat == 0.0 || lng == 0.0) {
                                                lat = null;
                                                lng = null;
                                            }
                                        } else {
                                            log.warn("⚠️ 숙소 좌표 없음: stayId={}", itemDto.getStayId());
                                        }
                                    } catch (Exception e) {
                                        log.error("숙소 좌표 변환 오류: stayId=" + itemDto.getStayId(), e);
                                    }
                                }

                                return TravelPlanItem.builder()
                                        .day(day)
                                        .title(itemDto.getTitle())
                                        .type(itemDto.getType())
                                        .travelId(itemDto.getTravelId())
                                        .stayId(itemDto.getStayId())
                                        .stayName(itemDto.getStayName())
                                        .lat(lat)
                                        .lng(lng)
                                        .img(itemDto.getImg())
                                        .startTime(itemDto.getStartTime())
                                        .endTime(itemDto.getEndTime())
                                        .build();
                            })
                            .collect(Collectors.toCollection(LinkedHashSet::new));
                    day.setItems(itemEntities);
                }

                plan.getDays().add(day);
            });
        }

        em.flush(); // ✅ 변경사항 즉시 DB 반영
    }


    /** ✅ 여행계획 삭제 */
    @Override
    @Transactional
    public void deletePlan(Long planId, String userId) {
        TravelPlan plan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("해당 여행계획이 존재하지 않습니다."));

        if (!plan.getUser().getId().equals(userId)) {
            throw new SecurityException("삭제 권한이 없습니다.");
        }

        travelPlanRepository.delete(plan);
        log.info("✅ 여행계획 삭제 완료: planId={}, userId={}", planId, userId);
    }

    /** ✅ 개별 일정(여행지/숙소 등) 삭제 */
    @Override
    public void deleteItem(Long itemId) {
        log.info("🗑️ 단일 일정 삭제 요청: itemId={}", itemId);

        if (!travelPlanItemRepository.existsById(itemId)) {
            throw new EntityNotFoundException("삭제할 일정 아이템이 존재하지 않습니다.");
        }

        travelPlanItemRepository.deleteItemById(itemId);
        em.flush(); // ✅ 즉시 반영
        log.info("✅ 일정 아이템 삭제 완료: itemId={}", itemId);
    }
}
