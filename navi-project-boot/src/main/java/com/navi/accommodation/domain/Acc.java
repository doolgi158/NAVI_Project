package com.navi.accommodation.domain;

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

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="navi_accommodation")

public class Acc {
    /*
    * [Column]
    * 1. 숙소 ID(accId)          7. 주소(address)           13. 취사 여부(has_cooking)
    * 2. 원본 ID(sourceId)       8. 위도(mapy)              14. 주차 시설 여부(has_parking)
    * 3. 숙소 이름(title)         9. 경도(mapx)              15. 삭제 가능 여부(is_deletable)
    * 4. 숙소 구분(category)      10. 설명(overview)         16. 운영 여부(is_active)
    * 5. 문의 번호(tel)           11. 체크인(checkIn)        17. 등록일자(created_at)
    * 6. 지역 ID(townshipId)     12. 체크아웃(checkOut)      18. 수정일자(updated_at)
    * */
    @Id
    @Column(name = "acc_id", length = 20)
    private String accId;

    @Column(name = "source_id", unique = false)
    private Long contentId;

    @Column(length = 50, nullable = false)
    private String title;

    @Column(columnDefinition = "NVARCHAR2(10)", nullable = false)
    private String category;

    @Column(length = 20)
    private String tel;

    @Column(name = "township_id", nullable = false)
    private int townshipId;

    @Column(length = 200, nullable = false)
    private String address;

    @Column(name = "latitude", precision = 10, scale = 7,columnDefinition = "NUMBER(10, 7)")
    private BigDecimal mapy;

    @Column(name = "longitude", precision = 10, scale = 7, columnDefinition = "NUMBER(10, 7)")
    private BigDecimal mapx;

    @Lob
    @Column(name = "description")
    private String overview;

    @Builder.Default
    @Column(name = "checkin", length = 5, nullable = false)
    private String checkIn = "15:00";

    @Builder.Default
    @Column(name = "checkout", length = 5, nullable = false)
    private String checkOut = "11:00";

    @Builder.Default
    @Column(name = "has_cooking", nullable = false)
    private Boolean hasCooking = false;

    @Builder.Default
    @Column(name = "has_parking", nullable = false)
    private Boolean hasParking = false;

    @Builder.Default
    @Column(name = "is_deletable", nullable = false)
    private Boolean isDeletable = false;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_time", nullable = false)
    private LocalDateTime modifiedTime = LocalDateTime.now();

    // API 에서 null이 들어오면 기본값이 무력화되고 Hibernate는 null을 그대로 INSERT
    // 따라서, DB 저장 직전에 null을 기본값으로 보정
    @PrePersist
    public void prePersist() {
        if (mapy == null) mapy = BigDecimal.ZERO;
        if (mapx == null) mapx = BigDecimal.ZERO;
        if (checkIn == null) checkIn = "15:00";
        if (checkOut == null) checkOut = "11:00";
        if (hasCooking == null) hasCooking = false;
        if (hasParking == null) hasParking = false;
        if (isDeletable == null) isDeletable = false;
        if (isActive == null) isActive = true;
    }

    // 수정일 자동 관리
    @PreUpdate
    public void preUpdate() {
        modifiedTime = LocalDateTime.now();
    }

    // FK 양방향 관계 설정
    @Builder.Default
    @OneToMany(mappedBy = "acc",
               cascade = CascadeType.ALL,
               fetch = FetchType.LAZY,
               orphanRemoval = true)
    private List<Room> rooms = new ArrayList<>();

    // change 메서드 - 임시
    public void changeTitle(String title) {
        this.title = title;
    }
}