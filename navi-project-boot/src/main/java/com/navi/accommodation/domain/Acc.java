package com.navi.accommodation.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.navi.accommodation.dto.api.AccApiDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/* [Column]
 * 0. No(no)
 * 1. 숙소 ID(accId)          7. 주소(address)           13. 취사 여부(has_cooking)
 * 2. 원본 ID(contentId)      8. 위도(mapy)              14. 주차 시설 여부(has_parking)
 * 3. 숙소 이름(title)         9. 경도(mapx)              15. 삭제 가능 여부(is_deletable)
 * 4. 숙소 구분(category)      10. 설명(overview)         16. 운영 여부(is_active)
 * 5. 문의 번호(tel)           11. 체크인(checkIn)        17. 등록일자(created_at)
 * 6. 지역 ID(townshipId)     12. 체크아웃(checkOut)      18. 수정일자(updated_at)
 */

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="navi_accommodation")
@SequenceGenerator(
        name = "navi_acc_generator",
        sequenceName = "navi_acc_seq",
        initialValue = 1,
        allocationSize = 1)
public class Acc {
    @Id
    @Column(name = "acc_no")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "navi_acc_generator")
    private Long accNo;

    @Column(name = "acc_id", length = 20, unique = true, updatable = false)
    private String accId;

    @Column(name = "content_id")
    private Long contentId;

    @Column(length = 50, nullable = false)
    private String title;

    @Column(columnDefinition = "NVARCHAR2(10)")
    private String category;

    @Column(length = 40)
    private String tel;

    @Column(name = "township_id", nullable = false)
    private int townshipId;

    @Column(length = 200, nullable = false)
    private String address;

    @Column(name = "mapy", precision = 10, scale = 7,columnDefinition = "NUMBER(10, 7)")
    private BigDecimal mapy;

    @Column(name = "mapx", precision = 10, scale = 7, columnDefinition = "NUMBER(10, 7)")
    private BigDecimal mapx;

    @Lob
    @Column(name = "overview")
    private String overview;

    @Builder.Default
    @Column(name = "checkin_time", length = 15, nullable = false)
    private String checkInTime = "15:00";

    @Builder.Default
    @Column(name = "checkout_time", length = 15, nullable = false)
    private String checkOutTime = "11:00";

    @Builder.Default
    @Column(name = "has_cooking", nullable = false)
    private Boolean hasCooking = false;

    @Builder.Default
    @Column(name = "has_parking", nullable = false)
    private Boolean hasParking = false;

    @Builder.Default
    @Column(name = "is_deletable", nullable = false)
    private boolean isDeletable = false;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;

    @Column(name = "modified_time", nullable = false)
    private LocalDateTime modifiedTime;

    // FK 양방향 관계 설정 : 숙소 - 객실
    @Builder.Default
    @OneToMany(mappedBy = "acc",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            orphanRemoval = true)
    @JsonManagedReference
    private List<Room> rooms = new ArrayList<>();

    // API 에서 null이 들어오면 기본값이 무력화되고 Hibernate는 null을 그대로 INSERT
    // 따라서, DB 저장 직전에 null을 기본값으로 보정 (for not null column)
    @PrePersist
    public void prePersist() {
        if (checkInTime == null) checkInTime = "15:00";
        if (checkOutTime == null) checkOutTime = "11:00";
        if (hasCooking == null) hasCooking = false;
        if (hasParking == null) hasParking = false;

        // acc_id 자동 생성
        if(accId == null && accNo != null){
            this.accId = String.format("ACC%03d", accNo);
        }
    }
    // 수정일 자동 관리
    @PreUpdate
    public void preUpdate() {
        // API 숙소는 modifiedTime 자동 갱신 안함
        if(contentId == null) {
            modifiedTime = LocalDateTime.now();
        }
    }

    // change 메서드 : 의도한 변경만 메서드로 모아 관리 가능
    /* === AccApiDTO : API 적재 전용 === */
    public void changeFromApiDTO(AccApiDTO dto, int townshipId) {
        if(!dto.getContentId().isBlank()) {
            contentId = Long.parseLong(dto.getContentId());
        }

        category = dto.getCategory();
        title = dto.getTitle();
        address = dto.getAddr1() + (!dto.getAddr2().isBlank() ? dto.getAddr2() : "");
        tel = dto.getTel();
        this.townshipId = townshipId;

        if(!dto.getMapx().isBlank()) {
            mapx = new BigDecimal(dto.getMapx());
        }
        if(!dto.getMapy().isBlank()) {
            mapy = new BigDecimal(dto.getMapy());
        }

        createdTime = LocalDateTime.parse(dto.getCreatedTime());
        modifiedTime = LocalDateTime.parse(dto.getModifiedTime());
    }
    /* === AccRequestDTO : 관지자 전용 === */
    public void changeFromRequestDTO(AccRequestDTO dto) {
        if (!dto.getTitle().isBlank()) this.title = dto.getTitle();
        if (!dto.getCategory().isBlank()) this.category = dto.getCategory();
        if (!dto.getTel().isBlank()) this.tel = dto.getTel();
        if (!dto.getAddress().isBlank()) this.address = dto.getAddress();
        if (!dto.getOverview().isBlank()) this.overview = dto.getOverview();
        if (!dto.getCheckInTime().isBlank()) this.checkInTime = dto.getCheckInTime();
        if (!dto.getCheckOutTime().isBlank()) this.checkOutTime = dto.getCheckOutTime();

        if (dto.getHasCooking() != null) {
            this.hasCooking = dto.getHasCooking();
        }
        if (dto.getHasParking() != null) {
            this.hasParking = dto.getHasParking();
        }

        this.isActive = dto.isActive();
        modifiedTime = LocalDateTime.now();
    }

}