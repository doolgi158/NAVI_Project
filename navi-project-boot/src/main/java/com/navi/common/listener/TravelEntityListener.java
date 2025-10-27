//package com.navi.common.listener;
//
//import com.navi.travel.domain.Travel;
//import jakarta.persistence.PrePersist;
//import jakarta.persistence.PreUpdate;
//
//import java.time.LocalDateTime;
//
//public class TravelEntityListener {
//
//    @PrePersist
//    public void onCreate(Travel travel) {
//        travel.setCreatedAt(LocalDateTime.now());
//        travel.setUpdatedAt(LocalDateTime.now());
//    }
//
//    @PreUpdate
//    public void onUpdate(Travel travel) {
//        // ✅ 좋아요/북마크/조회수만 바뀐 경우 updatedAt 갱신하지 않음
//        if (travel.isCounterOnlyChanged()) return;
//
//        travel.setUpdatedAt(LocalDateTime.now());
//    }
//}
