package com.navi.accommodation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccDetailResponseDTO {
    // 숙소 기본 정보
    private String accId;
    private String title;
    private String category;
    private String tel;
    private String address;
    private String overview;
    private String checkIn;
    private String checkOut;
    private Boolean hasCooking;
    private Boolean hasParking;

    // 객실 리스트 포함
    //private List<RsvDetailDTO> rooms;
    // 숙소 이미지 포함
    //private List<String> images;
}
