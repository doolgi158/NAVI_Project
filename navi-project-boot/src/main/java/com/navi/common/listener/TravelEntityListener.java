//package com.navi.common.listener;
//
//import com.navi.travel.domain.Travel;
//import jakarta.persistence.PrePersist;
//import jakarta.persistence.PreUpdate;
//
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//import java.util.concurrent.atomic.AtomicInteger;
//
//public class TravelEntityListener {
//
//    // ✅ 동일 밀리초 내 생성 순서를 위한 AtomicInteger
//    private static final AtomicInteger COUNTER = new AtomicInteger(0);
//
//    @PrePersist
//    public void prePersist(Travel travel) {
//        // 등록 시 생성일/수정일 모두 초기화
//        travel.setCreatedAt(LocalDateTime.now());
//        travel.setUpdatedAt(LocalDateTime.now());
//
//        // ✅ 최초 생성 시 photoId 자동 생성
//        generatePhotoIdIfNeeded(travel);
//    }
//
//    @PreUpdate
//    public void preUpdate(Travel travel) {
//        // ✅ 좋아요/북마크/조회수만 바뀐 경우 updatedAt 갱신하지 않음
//        if (!travel.isCounterOnlyChanged()) {
//            travel.setUpdatedAt(LocalDateTime.now());
//        }
//
//        // ✅ 이미지/썸네일 변경 시 photoId 생성
//        generatePhotoIdIfNeeded(travel);
//    }
//
//    /**
//     * ✅ photoId 자동 생성 로직
//     */
//    private void generatePhotoIdIfNeeded(Travel travel) {
//        boolean hasImage = travel.getImagePath() != null && !travel.getImagePath().isBlank();
//        boolean hasThumb = travel.getThumbnailPath() != null && !travel.getThumbnailPath().isBlank();
//
//        if ((hasImage || hasThumb) && (travel.getPhotoId() == null || travel.getPhotoId() == 0L)) {
//            String timestamp = LocalDateTime.now()
//                    .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
//
//            int sequence = COUNTER.getAndIncrement();
//            if (sequence > 999) {
//                COUNTER.set(0);
//                sequence = 0;
//            }
//
//            // ✅ 포맷: yyyyMMddHHmmssSSS + 3자리 순번 (20자리 방지)
//            String idStr = String.format("%s%03d", timestamp, sequence);
//
//            // ✅ Long 범위 초과 방지
//            if (idStr.length() > 18) {
//                idStr = idStr.substring(0, 18);
//            }
//
//            try {
//                long generatedId = Long.parseLong(idStr);
//                travel.setPhotoId(generatedId);
//            } catch (NumberFormatException e) {
//                System.err.println("⚠️ photoId 생성 오류: " + idStr);
//                travel.setPhotoId(System.currentTimeMillis()); // fallback
//            }
//        }
//    }
//}
