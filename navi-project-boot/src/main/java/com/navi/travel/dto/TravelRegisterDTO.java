//package com.navi.travel.dto;
//
//import com.navi.travel.domain.Travel;
//import lombok.Getter;
//import lombok.Setter;
//
//import java.math.BigDecimal;
//
//@Getter
//@Setter
//public class TravelRegisterDTO {
//
//    private String contentsCd;      // 카테고리 코드
//    private String title;           // 여행지 제목
//    private String introduction;    // 여행지 소개
//    private String roadAddress;     // 도로명 주소
//    private String tel;             // 전화번호
//    private String tags;            // 태그정보
//    private String imagePath;       // 대표사진경로
//    private int state = 1;          // 기본 상태: 공개(1)
//
//    // DTO를 Travel 엔티티로 변환하는 메서드 (최초 등록)
//    public Travel toEntity() {
//        // ... (TravelApiDTO의 toEntity와 유사한 로직, 필요한 필드만 매핑)
//        return Travel.builder()
//                .title(this.title)
//                .contentsCd(this.contentsCd)
//                .introduction(this.introduction)
//                .roadAddress(this.roadAddress)
//                .tel(this.tel)
//                .tags(this.tags)
//                .imagePath(this.imagePath)
//                .state(this.state)
//                .build();
//    }
//}
