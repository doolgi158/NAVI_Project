//package com.navi.user.service.admin;
//
//import com.navi.travel.domain.Travel;
//import com.navi.user.dto.admin.AdminDashboardDTO;
//import com.navi.user.repository.DashboardTravelRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.Arrays;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//public class AdminTravelDashboardServiceImpl implements AdminTravelDashboardService {
//    private final DashboardTravelRepository dashboardTravelRepository;
//
//    public AdminDashboardDTO.Travels getTravelStats() {
//        long total = dashboardTravelRepository.count();
//        long totalViews = dashboardTravelRepository.sumViews();
//
//        return AdminDashboardDTO.Travels.builder()
//                .count(total)
//                .totalViews(totalViews)
//                .changedPct(0) // 나중에 전월 대비 증감률 계산
//                .build();
//    }
//
//    /**
//     * 인기 여행지 Top5
//     * rank, title, id, region, score(조회수+좋아요+북마크)
//     */
//
//    public List<Map<String, Object>> getTopTravelRank() {
//        List<Travel> topList = dashboardTravelRepository.findTop5Popular();
//
//        return topList.stream()
//                .map((t) -> {
//                    Map<String, Object> map = new HashMap<>();
//                    map.put("rank", topList.indexOf(t) + 1);
//                    map.put("title", t.getTitle());
//                    map.put("id", t.getTravelId());
//
//                    // 주소에서 '읍/면/동/리'까지만 추출
//                    String shortRegion = extractRegionName(t.getAddress());
//                    map.put("region", shortRegion);
//
//                    // 점수 계산
//                    long score = (t.getViews() != null ? t.getViews() : 0)
//                            + (t.getLikesCount() != null ? t.getLikesCount() : 0)
//                            + (t.getBookmarkCount() != null ? t.getBookmarkCount() : 0);
//                    map.put("score", score);
//                    return map;
//                })
//                .toList();
//    }
//
//    /**
//     * ✅ 지역 문자열에서 읍/면/동/리까지만 추출
//     * 예: "제주특별자치도 서귀포시 성산읍 성산리 123-1" → "성산읍 성산리"
//     */
//    private String extractRegionName(String fullRegion) {
//        if (fullRegion == null || fullRegion.isBlank()) return "-";
//
//        // 공백 기준으로 분리
//        String[] parts = fullRegion.split(" ");
//
//        // 읍/면/동/리 단어가 포함된 인덱스를 찾음
//        int endIndex = -1;
//        for (int i = 0; i < parts.length; i++) {
//            if (parts[i].endsWith("읍") || parts[i].endsWith("면") ||
//                    parts[i].endsWith("동") || parts[i].endsWith("리")) {
//                endIndex = i;
//            }
//        }
//
//        if (endIndex >= 0) {
//            // 해당 위치까지 병합
//            return String.join(" ", Arrays.copyOfRange(parts, 0, endIndex + 1))
//                    .replaceAll("^(.*시\\s)?", ""); // "서울시", "서귀포시" 같은 상위 지역은 제거
//        }
//
//        // 못 찾으면 원본 반환
//        return fullRegion;
//    }
//}
