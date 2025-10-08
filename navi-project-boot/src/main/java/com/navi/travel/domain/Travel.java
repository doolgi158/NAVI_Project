package com.navi.travel.domain;

import com.navi.common.entity.BaseEntity;

import com.navi.travel.dto.TravelRequestDTO;
import jakarta.persistence.*;
import lombok.*;


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

    @Column(name = "CATEGORY_REF_ID", length = 150)
    private String categoryRefId;   //카테고리 참조id

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

    // 지역 코드 정보
    @Column(name = "REGION1_CD", length = 10)
    private String region1Cd;   //시코드

    @Column(name = "REGION1_NAME", length = 150)
    private String region1Name;     //시명(제주시,서귀포시)

    @Column(name = "REGION1_REF_ID", length = 150)
    private String region1RefId;    //시참조id

    @Column(name = "REGION2_CD", length = 10)
    private String region2Cd;    //읍코드

    @Column(name = "REGION2_NAME", length = 150)
    private String region2Name; //읍명

    @Column(name = "REGION2_REF_ID", length = 150)
    private String region2RefId;    //읍참조id

    // 사진 정보
    @Column(name = "PHOTO_ID")
    private Long photoId;   //사진id

    @Column(name = "IMAGE_PATH", length = 500)
    private String imagePath;   //대표사진경로

    @Column(name = "THUMBNAIL_PATH", length = 500)
    private String thumbnailPath;   //서브사진경로

    @Builder.Default
    @Column(name = "VIEWS_COUNT", nullable = false)
    private Long views = 0L; // 조회수 (초기값 0 설정)

    @Builder.Default
    @Column(name = "LIKES_COUNT", nullable = false)
    private Long likes = 0L; // 좋아요 수 (초기값 0 설정)

    @Builder.Default
    @Column(name = "BOOKMARK_COUNT", nullable = false, columnDefinition = "NUMBER default 0")
    private Long bookmark = 0L; // 북마크 수 (초기값 0 설정)

    @Column(name = "STATE", nullable = false)
    private int state;  // 개시상태(공개, 비공개)

    /**
     * 외부 API 데이터를 기반으로 기존 엔티티의 필드 값을 업데이트하는 메소드
     * (콘텐츠 ID(contentId)가 이미 존재할 때 사용)
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
        this.categoryRefId = newTravel.categoryRefId;
        this.region1Cd = newTravel.region1Cd;
        this.region1Name = newTravel.region1Name;
        this.region1RefId = newTravel.region1RefId;
        this.region2Cd = newTravel.region2Cd;
        this.region2Name = newTravel.region2Name;
        this.region2RefId = newTravel.region2RefId;
        this.photoId = newTravel.photoId;
        this.imagePath = newTravel.imagePath;
        this.thumbnailPath = newTravel.thumbnailPath;
        this.state = newTravel.state;
    }

    // 조회수를 1 증가
    public void incrementViews() {
        this.views = (this.views == null) ? 1L : this.views + 1;
    }

    // 좋아요 카운트 증가
    public void incrementLikes() {
        this.likes = this.likes + 1;
    }

    // 좋아요 카운트 감소 (좋아요 취소시)
    public void decrementLikes() {
        if (this.likes > 0) {
            this.likes = this.likes - 1;
        }
    }
    
    //여행지 정보 수동 업데이트
    public void updateFromRequest(TravelRequestDTO dto) {
        this.contentsCd = dto.getContentsCd();
        this.title = dto.getTitle();
        this.introduction = dto.getIntroduction();
        this.address = dto.getAddress();
        this.roadAddress = dto.getRoadAddress();
        this.phoneNo = dto.getPhoneNo();
        this.tag = dto.getTag();
        this.longitude = dto.getLongitude();
        this.latitude = dto.getLatitude();
        this.categoryName = dto.getCategoryName();
        this.region1Name = dto.getRegion1Name();
        this.region2Name = dto.getRegion2Name();
        this.imagePath = dto.getImagePath();
        this.thumbnailPath = dto.getThumbnailPath();
        this.state = dto.getState() != null ? dto.getState() : 1;
        // contentId와 카운터 필드(views, likes, bookmark)는 여기서 업데이트하지 않습니다.
    }
    

}