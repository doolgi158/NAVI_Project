package com.navi.accommodation.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccRequestDTO {    /* 숙소 등록, 수정 요청 */
    private String title;
    private String category;
    private String tel;
    private String address;
    private String overview;
    private String checkInTime;
    private String checkOutTime;
    private Boolean hasCooking;
    private Boolean hasParking;
    private boolean isActive;
}
