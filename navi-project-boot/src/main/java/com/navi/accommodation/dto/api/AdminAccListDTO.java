package com.navi.accommodation.dto.api;

import com.navi.accommodation.domain.Acc;
import lombok.*;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class AdminAccListDTO {
    private Long accNo;            // 내부 식별번호 (PK)
    private String accId;          // 숙소 코드 (ACC001)
    private Long contentId;        // 외부 API ID (TourAPI용)
    private String title;          // 숙소명
    private String category;       // 숙소 유형
    private String tel;            // 전화번호
    private String address;        // 전체 주소

    private BigDecimal mapx;       // 경도
    private BigDecimal mapy;       // 위도
    private String overview;       // 숙소 설명

    private boolean hasCooking;    // 취사 가능 여부
    private boolean hasParking;    // 주차 가능 여부
    private boolean isActive;      // 운영 여부

    private String checkInTime;    // 체크인 시간
    private String checkOutTime;   // 체크아웃 시간

    private String mainImage;      // 대표 이미지 (경로)
    private Long viewCount;        // 조회수

    private String createdTime;    // 등록일 (yyyy-MM-dd HH:mm)
    private String modifiedTime;   // 수정일 (yyyy-MM-dd HH:mm)

    private transient String localImagePath; // 로컬 임시 이미지 경로 (프론트 표시용)

    public static AdminAccListDTO fromEntity(Acc acc) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        return AdminAccListDTO.builder()
                .accNo(acc.getAccNo())
                .accId(acc.getAccId())
                .contentId(acc.getContentId())
                .title(acc.getTitle())
                .category(acc.getCategory())
                .tel(acc.getTel())
                .address(acc.getAddress())
                .mapx(acc.getMapx())
                .mapy(acc.getMapy())
                .overview(acc.getOverview())
                .hasCooking(acc.getHasCooking())
                .hasParking(acc.getHasParking())
                .isActive(acc.getActive())
                .checkInTime(acc.getCheckInTime())
                .checkOutTime(acc.getCheckOutTime())
                .mainImage(acc.getMainImage())
                .viewCount(acc.getViewCount())
                .createdTime(acc.getCreatedTime() != null ? acc.getCreatedTime().format(fmt) : null)
                .modifiedTime(acc.getModifiedTime() != null ? acc.getModifiedTime().format(fmt) : null)
                .build();
    }
}
