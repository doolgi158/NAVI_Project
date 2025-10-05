package com.navi.accommodation.domain;

import com.navi.accommodation.dto.api.RoomApiDTO;
import com.navi.accommodation.dto.request.RoomRequestDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/* [Column]
 * 0. no(roomNo)
 * 1. 객실 ID(roomId)      6. 기준인원(baseCnt)
 * 2. 숙소 ID(accId)       7. 최대인원(maxCnt)
 * 3. 객실명(roomName)      8. 주중가격(weekdayFee)
 * 4. 객실크기(roomSize)    9. 주말가격(weekendFee)
 * 5. 객실수(roomCnt)      10. 운영여부(isActive)
 */

@Getter
@Builder
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

    // 임시 설정 - json 파일 O, API X
    @Column(name = "content_id")
    private Long contentId;

    // FK 설정
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="accNo", nullable = false)
    private Acc acc;

    @Column(name = "room_name", columnDefinition = "NVARCHAR2(50)", nullable = false)
    private String roomName;

    @Column(name = "room_size")
    private Integer roomSize;

    @Builder.Default
    @Column(nullable = false)
    private Integer roomCnt = 1;

    @Builder.Default
    @Column(name = "base_cnt", nullable = false)
    private Integer baseCnt = 2;

    @Builder.Default
    @Column(name = "max_cnt", nullable = false)
    private Integer maxCnt = 2;

    @Builder.Default
    @Column(name = "weekday_fee", nullable = false)
    private Integer weekdayFee = 0;

    @Builder.Default
    @Column(name = "weekend_fee", nullable = false)
    private Integer weekendFee = 0;

    @Builder.Default
    @Column(name = "has_wifi", nullable = false)
    private Boolean hasWifi = true;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // INSERT 전 기본값 보정
    @PrePersist
    public void prePersist() {
        if (roomCnt == null) roomCnt = 1;
        if (baseCnt == null) baseCnt = 2;
        if (maxCnt == null) maxCnt = 2;
        if (weekdayFee == null) weekdayFee = 0;
        if (weekendFee == null) weekendFee = 0;
        if (isActive == null) isActive = true;

        // room_id 자동 세팅
        if(roomId == null && roomNo != null){
            this.roomId = String.format("ROM%03d", roomNo);
        }
    }

    // change 메서드
    /* === AccApiDTO : API 적재 전용 === */
    public void changeFromApiDTO(RoomApiDTO dto) {
        if (nonEmptyOrNull(dto.getContentId()) != null) contentId = Long.parseLong(dto.getContentId());
        if (nonEmptyOrNull(dto.getRoomName()) != null) roomName = dto.getRoomName();
        if (nonEmptyOrNull(dto.getRoomSize()) != null) roomSize = Integer.parseInt(dto.getRoomSize());
        if (nonEmptyOrNull(dto.getRoomCnt()) != null) roomCnt = Integer.parseInt(dto.getRoomCnt());
        if (nonEmptyOrNull(dto.getBaseCnt()) != null) baseCnt = Integer.parseInt(dto.getBaseCnt());
        if (nonEmptyOrNull(dto.getMaxCnt()) != null) maxCnt = Integer.parseInt(dto.getMaxCnt());
        if (nonEmptyOrNull(dto.getWeekdayFee()) != null) weekdayFee = Integer.parseInt(dto.getWeekdayFee());
        if (nonEmptyOrNull(dto.getWeekendFee()) != null) weekendFee = Integer.parseInt(dto.getWeekendFee());
        if (nonEmptyOrNull(dto.getHasWifi()) != null) hasWifi = "1".equals(dto.getHasWifi());
    }
    /* === AccRequestDTO : 관지자 전용 === */
    public void changeFromRequestDTO(RoomRequestDTO dto) {

    }

    /* 문자열 유효성 검증용 유틸 메서드 */
    private String nonEmptyOrNull(String value) {
        return (value != null && !value.isBlank()) ? value : null;
    }
}
