package com.navi.accommodation.dto;

import com.navi.accommodation.domain.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccRequestDTO {
    private String accId;
    private Long sourceId;
    private String title;
    private String category;
    private String tel;
    private int townshipId;
    private String address;
    //private Double mapy = 0.0;
    //private Double mapx = 0.0;
    private String overview;
    private String checkIn = "15:00";
    private String checkOut = "11:00";
    private Boolean hasCooking = false;
    private Boolean hasParking = false;
    private Boolean isDeletable = false;
    private Boolean isActive = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Room> rooms = new ArrayList<>();
}
