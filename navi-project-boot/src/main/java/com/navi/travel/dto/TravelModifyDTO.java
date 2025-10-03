package com.navi.travel.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TravelModifyDTO {
    private Long travelId;          // (필수) 수정할 여행지 ID

    // 수정 가능한 필드 목록
    private String title;           // 여행지 제목
    private String introduction;    // 여행지 소개
    private String roadAddress;     // 도로명 주소
    private String tel;             // 전화번호
    private String tags;            // 태그정보
    private String imagePath;       // 대표사진경로
    private int state;              // 개시상태
}


