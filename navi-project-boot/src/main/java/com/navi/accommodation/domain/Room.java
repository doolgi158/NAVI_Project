package com.navi.accommodation.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="NAVI_ROOM")
public class Room {
    /*
    * [Column]
    * 1. 객실 ID(roomId)      6. 기준인원(baseCnt)
    * 2. 숙소 ID(accId)       7. 최대인원(maxCnt)
    * 3. 객실명(roomName)      8. 주중가격(weekdayFee)
    * 4. 객실크기(roomSize)    9. 주말가격(weekendFee)
    * 5. 객실수(roomCnt)      10. 운영여부(isActive)
    * */

    @Id
    @Column(name = "room_id", length = 20)
    private String roomId;

    // FK 설정
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="acc_id", nullable = false)
    private Acc acc;

    @Column(name = "room_name", columnDefinition = "NVARCHAR2(50)", nullable = false)
    private String roomName;

    @Column(name = "room_size")
    private Integer roomSize;

    @Column(nullable = false)
    private Integer roomCnt = 1;

    @Column(name = "base_cnt", nullable = false)
    private Integer baseCnt = 2;

    @Column(name = "max_cnt", nullable = false)
    private Integer maxCnt = 2;

    @Column(name = "weekday_fee", nullable = false)
    private Integer weekdayFee = 0;

    @Column(name = "weekend_fee", nullable = false)
    private Integer weekendFee = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @PrePersist
    public void prePersist() {
        if (roomCnt == null) roomCnt = 1;
        if (baseCnt == null) baseCnt = 0;
        if (maxCnt == null) maxCnt = 0;
        if (weekdayFee == null) weekdayFee = 0;
        if (weekendFee == null) weekendFee = 0;
        if (isActive == null) isActive = true;
    }
}
