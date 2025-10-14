package com.navi.travel.domain;

import com.navi.common.entity.BaseEntity;

import com.navi.travel.dto.TravelRequestDTO;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.util.StringUtils;


@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity

@Table(name="NAVI_TRAVEL")
@SequenceGenerator(name = "travel_seq", sequenceName = "TRAVEL_SEQ", allocationSize = 1)
public class Travel extends BaseEntity { //등록일 수정일 자동생성 상속


    // 여행지 ID (내부 PK, SEQUENCE 활용)
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "travel_seq")
    @Column(name = "TRAVEL_ID")
    private Long travelId;

    // 콘텐츠 ID (외부API의 여행지id, UNIQUE)
    @Column(name = "CONTENTS_ID", unique = true, length = 50)
    private String contentId;

    // 카테고리 정보
    @Column(name = "CONTENTS_CD", nullable = false, length = 15)
    private String contentsCd;  //카테고리 id

    @Column(name = "CATEGORY_NAME", length = 150)
    private String categoryName;    //카테고리 이름 (숙박,축제/행사 등)

    // 기본 정보
    @Column(name = "TITLE", nullable = false, length = 500)
    private String title;   //여행지 제목

    @Column(name = "INTRODUCTION",columnDefinition = "CLOB")
    @Lob // Oracle의 CLOB 타입과 매핑
    private String introduction;    //여행지 소개

    // 주소 및 연락처
    @Column(name = "ADDRESS", length = 500)
    private String address;     //지번주소

    @Column(name = "ROAD_ADDRESS", length = 500)
    private String roadAddress;     //도로명 주소

    @Column(name = "PHONE_NO", length = 50)
    private String phoneNo;     //전화번호

    @Column(name = "TAG", length = 500)
    private String tag;    // 태그정보

    // GPS 좌표
    @Column(name = "longitude")
    private Double longitude; // 경도

    @Column(name = "latitude")
    private Double latitude; // 위도

    // 지역 정보
    @Column(name = "REGION1_NAME", length = 150)
    private String region1Name;     //시명(제주시,서귀포시)

    @Column(name = "REGION2_NAME", length = 150)
    private String region2Name; //읍명

    // 사진 정보
    @Column(name = "PHOTO_ID")
    private Long photoId;   //사진id

    @Column(name = "IMAGE_PATH", length = 500)
    private String imagePath;   //대표사진경로

    @Column(name = "THUMBNAIL_PATH", length = 500)
    private String thumbnailPath;   //서브사진경로

    @Builder.Default
    @Column(name = "VIEWS_COUNT", nullable = false,columnDefinition ="NUMBER default 0")
    private Long views = 0L; // 조회수 (초기값 0 설정)


    @Column(name = "STATE", nullable = false,columnDefinition = "NUMBER(1) default 1" )
    private int state;  // 개시상태(공개, 비공개)

    @Column(name="HOMEPAGE", length=500)
    private String homepage;    //홈페이지

    @Column(name="PARKING", length=2000)
    private String parking;    //주차시설

    @Column(name="FEE", length=2000)
    private String fee;    //이용요금

    @Column(name="HOURS", length=2000)
    private String hours;    //이용시간


    /**
     * 외부 API 데이터를 기반으로 기존 엔티티의 필드 값을 업데이트하는 메소드
     */
    public void updateFromApi(Travel newTravel) {
        this.title = newTravel.title;
        this.introduction = newTravel.introduction;
        this.address = newTravel.address;
        this.roadAddress = newTravel.roadAddress;
        this.phoneNo = newTravel.phoneNo;
        this.tag = newTravel.tag;
        this.longitude = newTravel.longitude;
        this.latitude = newTravel.latitude;
        this.contentsCd = newTravel.contentsCd;
        this.categoryName = newTravel.categoryName;
        this.region1Name = newTravel.region1Name;
        this.region2Name = newTravel.region2Name;
        this.photoId = newTravel.photoId;
        this.imagePath = newTravel.imagePath;
        this.thumbnailPath = newTravel.thumbnailPath;
        this.state = newTravel.state;
        this.homepage = newTravel.homepage;
        this.parking = newTravel.parking;
        this.fee = newTravel.fee;
        this.hours = newTravel.hours;
    }

    // 조회수를 1 증가 (TravelServiceImpl에서 TravelRepository의 @Modifying 쿼리로 대체)
    public void incrementViews() {
        this.views = (this.views == null) ? 1L : this.views + 1;
    }

    //여행지 정보 수동 업데이트
    public void updateFromRequest(TravelRequestDTO dto) {
        if (StringUtils.hasText(dto.getContentsCd())) this.contentsCd = dto.getContentsCd();
        if (StringUtils.hasText(dto.getTitle())) this.title = dto.getTitle();
        if (StringUtils.hasText(dto.getIntroduction())) this.introduction = dto.getIntroduction();
        if (StringUtils.hasText(dto.getAddress())) this.address = dto.getAddress();
        if (StringUtils.hasText(dto.getRoadAddress())) this.roadAddress = dto.getRoadAddress();
        if (StringUtils.hasText(dto.getPhoneNo())) this.phoneNo = dto.getPhoneNo();
        if (StringUtils.hasText(dto.getTag())) this.tag = dto.getTag();
        if (dto.getLongitude() != null) this.longitude = dto.getLongitude();
        if (dto.getLatitude() != null) this.latitude = dto.getLatitude();
        if (StringUtils.hasText(dto.getCategoryName())) this.categoryName = dto.getCategoryName();

        if (StringUtils.hasText(dto.getRegion1Name())) this.region1Name = dto.getRegion1Name();
        if (StringUtils.hasText(dto.getRegion2Name())) this.region2Name = dto.getRegion2Name();

        if (dto.getPhotoId() != null) this.photoId = dto.getPhotoId();

        if (StringUtils.hasText(dto.getImagePath())) {
            this.imagePath = dto.getImagePath();
        }

        if (StringUtils.hasText(dto.getThumbnailPath())) {
            this.thumbnailPath = dto.getThumbnailPath();
        }
        this.state = dto.getState();
        if (StringUtils.hasText(dto.getHomepage())) this.homepage = dto.getHomepage();
        if (StringUtils.hasText(dto.getParking())) this.parking = dto.getParking();
        if (StringUtils.hasText(dto.getFee())) this.fee = dto.getFee();
        if (StringUtils.hasText(dto.getHours())) this.hours = dto.getHours();

    }


}