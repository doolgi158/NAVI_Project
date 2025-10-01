package com.navi.accommodation.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/*
 * [Column]
 * 1. 객실 ID(roomId)      6. 기준인원(baseCnt)
 * 2. 숙소 ID(accId)       7. 최대인원(maxCnt)
 * 3. 객실명(roomName)      8. 주중가격(weekdayFee)
 * 4. 객실크기(roomSize)    9. 주말가격(weekendFee)
 * 5. 객실수(roomCnt)      10. 운영여부(isActive)
 * */


@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="navi_room")
@SequenceGenerator(
        name = "navi_room_generator",
        sequenceName = "navi_room_seq",
        initialValue = 1,
        allocationSize = 1)
public class Room {
    @Id
    @Column(name = "room_no")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "navi_room_generator")
    private Long roomNo;

    @Column(name = "room_id", length = 20, unique = true, updatable = false)
    private String roomId;

    // FK 설정
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="accNo", nullable = false)
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
        if (baseCnt == null) baseCnt = 2;
        if (maxCnt == null) maxCnt = 2;
        if (weekdayFee == null) weekdayFee = 0;
        if (weekendFee == null) weekendFee = 0;
        if (isActive == null) isActive = true;

        // acc_id 자동 세팅
        if(roomId == null && roomNo != null){
            this.roomId = String.format("ROM%03d", roomNo);
        }
    }
}
