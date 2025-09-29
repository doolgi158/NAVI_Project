package com.NAVI_Project.travel.domain;

import jakarta.persistence.*;

import java.sql.Clob;
import java.time.LocalDateTime;

@Entity
@Table(name="NAVI_TRAVEL")
public class Travel {
    
    // 여행지 ID (내부 PK, SEQUENCE 활용)
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "travel_seq")
    @SequenceGenerator(name = "travel_seq", sequenceName = "TRAVEL_SEQ", allocationSize = 1)
    @Column(name = "TRAVEL_ID")
    private Long travelId;

    // 콘텐츠 ID (외부API의 여행지id, UNIQUE)
    @Column(name = "CONTENTS_ID", unique = true, nullable = false, length = 50)
    private String contentId;

    // 카테고리 정보
    @Column(name = "CONTENTS_CD", nullable = false, length = 5)
    private String contentsCd;  //카테고리 id

    @Column(name = "CATEGORY_NAME", length = 50)
    private String categoryName;    //카테고리 이름 (숙박,축제/행사 등)

    @Column(name = "CATEGORY_REF_ID", length = 50)
    private String categoryRefId;   //카테고리 참조id

    // 기본 정보
    @Column(name = "TITLE", nullable = false, length = 255)
    private String title;   //여행지 제목

    @Column(name = "INTRODUCTION")
    @Lob // Oracle의 CLOB 타입과 매핑
    private String introduction;    //여행지 소개

    // 주소 및 연락처
    @Column(name = "ADDRESS", length = 255)
    private String address;     //지번주소

    @Column(name = "ROAD_ADDRESS", length = 255)
    private String roadAddress;     //도로명 주소

    @Column(name = "ZIPCODE", length = 10)
    private String zipcode;     //우편번호

    @Column(name = "TEL", length = 20)
    private String tel;     //전화번호

    @Column(name = "TAGS")
    private String tags;    // 태그정보

    // GPS 좌표
    @Column(name = "MAPX", precision = 10, scale = 7)
    private Double mapX; // 경도

    @Column(name = "MAPY", precision = 10, scale = 7)
    private Double mapY; // 위도

    // 지역 코드 정보
    @Column(name = "REGION1_CD", length = 10)
    private String region1Cd;   //시코드

    @Column(name = "REGION1_NAME", length = 50)
    private String region1Name;     //시명(제주시,서귀포시)

    @Column(name = "REGION1_REF_ID", length = 50)
    private String region1RefId;    //시참조id

    @Column(name = "REGION2_CD", length = 10)
    private String region2Cd;    //읍코드

    @Column(name = "REGION2_NAME", length = 50)
    private String region2Name; //읍명

    @Column(name = "REGION2_REF_ID", length = 50)
    private String region2RefId;    //읍참조id

    // 사진 정보
    @Column(name = "PHOTO_ID")
    private Long photoId;   //사진id

    @Column(name = "IMAGE_PATH", length = 500)
    private String imagePath;   //대표사진경로

    @Column(name = "THUMBNAIL_PATH", length = 500)
    private String thumbnailPath;   //서브사진경로

    // 관리 정보
    @Column(name = "MODIFIED_DATE")
    private LocalDateTime modifiedDate; //수정일

    @Column(name = "CREATED_DATE")
    private LocalDateTime createdDate;  //생성일

    @Column(name = "STATE")
    private int state;  // 개시상태(공개, 비공개)
}
