package com.navi.planner.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.repository.AccRepository;
import com.navi.image.domain.Image;
import com.navi.image.repository.ImageRepository;
import com.navi.planner.domain.TravelPlan;
import com.navi.planner.domain.TravelPlanDay;
import com.navi.planner.dto.TravelPlanDetailResponseDTO;
import com.navi.planner.dto.TravelPlanListResponseDTO;
import com.navi.planner.repository.TravelPlanRepository;
import com.navi.travel.domain.Travel;
import com.navi.travel.repository.TravelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TravelPlanQueryService {

    private final TravelPlanRepository travelPlanRepository;
    private final TravelRepository travelRepository;
    private final ImageRepository imageRepository;
    private final AccRepository accRepository;

    /** ✅ 사용자별 여행계획 목록 조회 */
    public List<TravelPlanListResponseDTO> getMyPlans(String userId) {
        List<TravelPlan> plans = travelPlanRepository.findByUser_Id(userId); // ✅ User.id 기준
        return plans.stream()
                .map(TravelPlanListResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /** ✅ 여행계획 상세조회 */
    public TravelPlanDetailResponseDTO getPlanDetail(Long planId, String userId) {
        TravelPlan plan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 여행계획입니다. id=" + planId));

        if (!plan.getUser().getId().equals(userId)) { // ✅ 필드명 기준
            throw new SecurityException("이 여행계획에 접근할 권한이 없습니다.");
        }

        for (TravelPlanDay day : plan.getDays()) {
            if (day.getTravelId() != null) {
                travelRepository.findById(day.getTravelId()).ifPresent(travel -> {
                    String imgUrl = resolveTravelImage(travel);
                    injectDayData(day, travel.getLatitude(), travel.getLongitude(), imgUrl);
                });
            } else if (day.getStayName() != null && !day.getStayName().isBlank()) {
                accRepository.findByTitleContainingIgnoreCase(day.getStayName())
                        .stream()
                        .findFirst()
                        .ifPresent(acc -> {
                            String imgUrl = resolveAccImage(acc);
                            injectDayData(day,
                                    acc.getMapy() != null ? acc.getMapy().doubleValue() : null,
                                    acc.getMapx() != null ? acc.getMapx().doubleValue() : null,
                                    imgUrl);
                        });
            }
        }

        return TravelPlanDetailResponseDTO.fromEntity(plan);
    }

    private void injectDayData(TravelPlanDay day, Double lat, Double lng, String img) {
        try {
            var latField = TravelPlanDay.class.getDeclaredField("latitude");
            var lngField = TravelPlanDay.class.getDeclaredField("longitude");
            var imgField = TravelPlanDay.class.getDeclaredField("imagePath");
            latField.setAccessible(true);
            lngField.setAccessible(true);
            imgField.setAccessible(true);
            latField.set(day, lat);
            lngField.set(day, lng);
            imgField.set(day, img);
        } catch (Exception e) {
            log.warn("⚠️ 좌표/이미지 주입 실패: {}", e.getMessage());
        }
    }

    private String resolveTravelImage(Travel travel) {
        try {
            Optional<Image> imgOpt = imageRepository
                    .findTopByTargetTypeAndTargetIdOrderByNoAsc("TRAVEL", String.valueOf(travel.getTravelId()));
            if (imgOpt.isPresent()) return imgOpt.get().getPath();
            if (travel.getThumbnailPath() != null && !travel.getThumbnailPath().isBlank())
                return travel.getThumbnailPath();
            if (travel.getImagePath() != null && !travel.getImagePath().isBlank()) {
                String[] imgs = travel.getImagePath().split(",");
                return imgs[0].trim();
            }
        } catch (Exception ignored) {}
        return "https://via.placeholder.com/400x300.png?text=No+Image";
    }

    private String resolveAccImage(Acc acc) {
        try {
            Optional<Image> imgOpt = imageRepository
                    .findTopByTargetTypeAndTargetIdOrderByNoAsc("ACC", acc.getAccId());
            if (imgOpt.isPresent()) return imgOpt.get().getPath();
        } catch (Exception ignored) {}
        return "https://via.placeholder.com/400x300.png?text=No+Image";
    }
}
