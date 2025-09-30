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
    private String checkIn;
    private String checkOut;
    private Boolean hasCooking;
    private Boolean hasParking;
    private Boolean isActive;
}
