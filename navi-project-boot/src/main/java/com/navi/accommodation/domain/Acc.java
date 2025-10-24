
package com.navi.accommodation.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.navi.accommodation.dto.api.AccApiDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.location.domain.Township;
import com.navi.room.domain.Room;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/* =====[NAVI_ACCOMMODATION]=====
        숙소 정보 관리 테이블
   ============================== */

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NAVI_ACCOMMODATION")
@SequenceGenerator(
        name = "acc_generator",
        sequenceName = "ACC_SEQ",
        initialValue = 1,
        allocationSize = 1)
public class Acc {
    /* === COLUMN 정의 === */
    // 내부 식별번호 (예: 1)
    @Id
    private Long accNo;

    // 숙소 ID (예: ACC001)
    @Column(name = "acc_id", length = 20, unique = true, updatable = false)
    private String accId;

    // 외부 원본 ID (API 전용)
    @Column(name = "content_id")
    private Long contentId;

    // 숙소명
    @Column(length = 50, nullable = false)
    private String title;

    // 숙소 유형 (호텔, 펜션 등)
    @Builder.Default
    @Nationalized @Column(length = 10)
    private String category = "미확인";

    // 문의 전화번호
    @Column(length = 40)
    private String tel;

    // 지역 ID (예: 5)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "township_id", nullable = false)
    private Township township;

    // 전체 주소
    @Column(length = 200, nullable = false)
    private String address;

    // 위도
    @Column(name = "mapy", precision = 10, scale = 7, columnDefinition = "NUMBER(10, 7)")
    private BigDecimal mapy;

    // 경도
    @Column(name = "mapx", precision = 10, scale = 7, columnDefinition = "NUMBER(10, 7)")
    private BigDecimal mapx;

    // 숙소 설명
    @Lob
    @Column(name = "overview")
    private String overview;

    // 체크인 시간 (예: 15:00)
    @Builder.Default
    @Column(name = "checkin_time", length = 15, nullable = false)
    private String checkInTime = "15:00";

    // 체크아웃 시간 (예: 11:00)
    @Builder.Default
    @Column(name = "checkout_time", length = 15, nullable = false)
    private String checkOutTime = "11:00";

    // 취사 가능 여부
    @Builder.Default
    @Column(name = "has_cooking", nullable = false)
    private Boolean hasCooking = false;

    // 주차 가능 여부
    @Builder.Default
    @Column(name = "has_parking", nullable = false)
    private Boolean hasParking = false;

    // 삭제 가능 여부
    @Builder.Default
    @Column(name = "is_deletable", nullable = false)
    private boolean isDeletable = false;

    // 운영 여부
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    // 등록일시
    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;

    // 수정일시
    @Column(name = "modified_time", nullable = false)
    private LocalDateTime modifiedTime;

    // 대표 이미지
    @Column(name = "main_image", length = 255)
    private String mainImage;

    // 조회수
    @Builder.Default
    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    /* === 연관관계 정의 === */
    @Builder.Default
    @OneToMany(mappedBy = "acc",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            orphanRemoval = true)
    @JsonManagedReference   // 양방향 순환참조 방지
    private List<Room> rooms = new ArrayList<>();

    /* === 기본값 보정 === */
    // API 에서 null이 들어오면 기본값이 무력화되고 Hibernate는 null을 그대로 INSERT
    // 따라서, INSERT 직전에 null을 기본값으로 보정하는 작업 (for not null column)
    @PrePersist
    public void prePersist() {
        if (category == null) category = "숙박시설";
        if (checkInTime == null) checkInTime = "15:00";
        if (checkOutTime == null) checkOutTime = "11:00";
        if (hasCooking == null) hasCooking = false;
        if (hasParking == null) hasParking = false;
        if (!this.active) this.active = true;
        if (createdTime == null) {
            createdTime = LocalDateTime.now();
            modifiedTime = LocalDateTime.now();
        }
    }

    /* === 수정일 자동 갱신 === */
    @PreUpdate
    public void preUpdate() {
        // API 데이터의 modifiedTime은 자동 갱신 안함
        if (contentId == null) {
            modifiedTime = LocalDateTime.now();
        }
    }

    /* === 데이터 갱신 메서드 === */
    // API 적재 전용(AccApiDTO)
    public void changeFromApiDTO(AccApiDTO dto, Township township) {
        if (nonEmptyOrNull(dto.getContentId()) != null)
            this.contentId = Long.parseLong(dto.getContentId());
        if (nonEmptyOrNull(dto.getCategory()) != null)
            this.category = dto.getCategory();
        if (nonEmptyOrNull(dto.getTitle()) != null)
            this.title = dto.getTitle();
        if (nonEmptyOrNull(dto.getTel()) != null)
            this.tel = dto.getTel();
        if (nonEmptyOrNull(dto.getAddr1()) != null)
            this.address = dto.getAddr1() + (nonEmptyOrNull(dto.getAddr2()) != null ? " " + dto.getAddr2() : "");
        if (nonEmptyOrNull(dto.getMapx()) != null)
            this.mapx = new BigDecimal(dto.getMapx());
        if (nonEmptyOrNull(dto.getMapy()) != null)
            this.mapy = new BigDecimal(dto.getMapy());
        if (nonEmptyOrNull(dto.getOverview()) != null)
            this.overview = dto.getOverview();
        if (nonEmptyOrNull(dto.getCheckInTime()) != null)
            this.checkInTime = dto.getCheckInTime();
        if (nonEmptyOrNull(dto.getCheckOutTime()) != null)
            this.checkOutTime = dto.getCheckOutTime();
        if (nonEmptyOrNull(dto.getHasCooking()) != null)
            this.hasCooking = "1".equals(dto.getHasCooking());
        if (nonEmptyOrNull(dto.getHasParking()) != null)
            this.hasParking = "1".equals(dto.getHasParking());

        this.township = township;
    }

    // 관리자 전용(AccRequestDTO)
    public void changeFromRequestDTO(AccRequestDTO dto) {
        this.title = nonEmptyOrNull(dto.getTitle()) != null
                ? dto.getTitle() : this.title;
        this.category = nonEmptyOrNull(dto.getCategory()) != null
                ? dto.getCategory() : this.category;
        this.tel = nonEmptyOrNull(dto.getTel()) != null
                ? dto.getTel() : this.tel;
        this.address = nonEmptyOrNull(dto.getAddress()) != null
                ? dto.getAddress() : this.address;
        this.overview = nonEmptyOrNull(dto.getOverview()) != null
                ? dto.getOverview() : this.overview;
        this.checkInTime = nonEmptyOrNull(dto.getCheckInTime()) != null
                ? dto.getCheckInTime() : this.checkInTime;
        this.checkOutTime = nonEmptyOrNull(dto.getCheckOutTime()) != null
                ? dto.getCheckOutTime() : this.checkOutTime;

        if (dto.getHasCooking() != null) this.hasCooking = dto.getHasCooking();
        if (dto.getHasParking() != null) this.hasParking = dto.getHasParking();

        this.active = dto.isActive();
    }

    public void changeTownship(Township township) {
        if (township != null) { this.township = township; }
    }
    public void updateMainImage(String mainImage) { this.mainImage = mainImage; }
    public void changeLocation(BigDecimal mapx, BigDecimal mapy) {
        if (mapx != null) { this.mapx = mapx; }
        if (mapy != null) { this.mapy = mapy; }
    }
    public void changeCategory(String category){ if (category != null) { this.category = category; } }

    /* === 문자열 유효성 검증용 유틸 메서드 === */
    private String nonEmptyOrNull(String value) {
        return (value != null && !value.isBlank()) ? value : null;
    }

    /* === 조회수 증가 메서드 === */
    public void increaseViewCount() {
        if (this.viewCount == null) this.viewCount = 0L;
        this.viewCount++;
    }
}
