package com.navi.accommodation.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
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

/*
 * [Column]
 * 0. No(no)
 * 1. 숙소 ID(accId)          7. 주소(address)           13. 취사 여부(has_cooking)
 * 2. 원본 ID(contentId)       8. 위도(mapy)              14. 주차 시설 여부(has_parking)
 * 3. 숙소 이름(title)         9. 경도(mapx)              15. 삭제 가능 여부(is_deletable)
 * 4. 숙소 구분(category)      10. 설명(overview)         16. 운영 여부(is_active)
 * 5. 문의 번호(tel)           11. 체크인(checkIn)        17. 등록일자(created_at)
 * 6. 지역 ID(townshipId)     12. 체크아웃(checkOut)      18. 수정일자(updated_at)
 * */

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

    // api 복구되면 unique = true 로 변경해야 함
    @Column(name = "content_id", unique = false)
    private Long contentId;

    @Column(length = 50, nullable = false)
    private String title;

    @Column(columnDefinition = "NVARCHAR2(10)", nullable = false)
    private String category;

    @Column(length = 50)
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
    @Column(name = "checkin", length = 15, nullable = false)
    private String checkIn = "15:00";

    @Builder.Default
    @Column(name = "checkout", length = 15, nullable = false)
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

    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;

    @Column(name = "updated_time", nullable = false)
    private LocalDateTime modifiedTime;

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

        // acc_id 자동 생성
        if(accId == null && accNo != null){
            this.accId = String.format("ACC%03d", accNo);
        }
    }

    // 수정일 자동 관리
    @PreUpdate
    public void preUpdate() {
        modifiedTime = LocalDateTime.now();
    }

    // FK 양방향 관계 설정 : 숙소 - 객실
    @Builder.Default
    @OneToMany(mappedBy = "acc",
               cascade = CascadeType.ALL,
               fetch = FetchType.LAZY,
               orphanRemoval = true)
    @JsonManagedReference
    private List<Room> rooms = new ArrayList<>();

    // 의도한 변경만 메서드로 모아 관리 가능
    public void changeDetails(String overview, String checkIn, String checkOut,
                              Boolean hasCooking, Boolean hasParking) {
        if (overview != null) this.overview = overview;
        if (checkIn != null) this.checkIn = checkIn;
        if (checkOut != null) this.checkOut = checkOut;
        if (hasCooking != null) this.hasCooking = hasCooking;
        if (hasParking != null) this.hasParking = hasParking;
    }
}