package com.navi.accommodation.dto.api;

import com.navi.accommodation.domain.Acc;
import lombok.Builder;
import lombok.Data;

import java.time.format.DateTimeFormatter;

@Data
@Builder
public class AdminAccListDTO {
    private Long accNo;            // 내부 식별번호
    private String accId;          // 숙소 코드 (ACC001)
    private Long contentId;        // 외부 API ID
    private String title;          // 숙소명
    private String category;       // 숙소 유형
    private String tel;            // 전화번호
    private String address;        // 전체 주소
    private String townshipName;   // 지역명
    private boolean hasCooking;    // 취사 가능
    private boolean hasParking;    // 주차 가능
    private boolean isActive;      // 운영 여부
    //private boolean isDeletable;   // 삭제 가능 여부
    private String checkInTime;    // 체크인 시간
    private String checkOutTime;   // 체크아웃 시간
    private Long viewCount;        // 조회수
    private String createdDate;    // 등록일
    private String modifiedDate;   // 수정일
    private Long townshipId;       // 지역 ID (필수)
    private String localImagePath;

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
                .townshipName(acc.getTownship() != null
                        ? acc.getTownship().getSigunguName() + " " + acc.getTownship().getTownshipName()
                        : "(미등록 지역)")
                .hasCooking(acc.getHasCooking())
                .hasParking(acc.getHasParking())
                .isActive(acc.getActive())
                //.isDeletable(acc.isDeletable())
                .checkInTime(acc.getCheckInTime())
                .checkOutTime(acc.getCheckOutTime())
                .viewCount(acc.getViewCount())
                .createdDate(acc.getCreatedTime() != null ? acc.getCreatedTime().format(fmt) : null)
                .modifiedDate(acc.getModifiedTime() != null ? acc.getModifiedTime().format(fmt) : null)
                .build();
    }
}
