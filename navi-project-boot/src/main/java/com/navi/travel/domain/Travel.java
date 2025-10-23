package com.navi.travel.domain;

import com.navi.common.entity.BaseEntityNoAudit;
import com.navi.common.listener.TravelEntityListener;
import com.navi.travel.dto.TravelRequestDTO;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString(exclude = {"likes", "bookmarks"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DynamicUpdate
@Entity
@EntityListeners(TravelEntityListener.class)
@Table(name = "NAVI_TRAVEL")
@SequenceGenerator(name = "travel_seq", sequenceName = "TRAVEL_SEQ", allocationSize = 1)
public class Travel extends BaseEntityNoAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "travel_seq")
    @Column(name = "TRAVEL_ID")
    private Long travelId;

    @Column(name = "CONTENTS_ID", unique = true, length = 50)
    private String contentId;

    @Column(name = "CONTENTS_CD", nullable = false, length = 15)
    private String contentsCd;

    @Column(name = "CATEGORY_NAME", length = 150)
    private String categoryName;

    @Column(name = "TITLE", nullable = false, length = 500)
    private String title;

    /**
     * ✅ 간단 소개 (요약)
     */
    @Lob
    @Column(name = "INTRODUCTION", columnDefinition = "CLOB")
    private String introduction;

    /**
     * ✅ 본문 (리치 텍스트 / react-quill HTML 저장용)
     */
    @Lob
    @Column(name = "DESCRIPTION", columnDefinition = "CLOB")
    private String description;

    @Column(name = "ADDRESS", length = 500)
    private String address;

    @Column(name = "ROAD_ADDRESS", length = 500)
    private String roadAddress;

    @Column(name = "PHONE_NO", length = 50)
    private String phoneNo;

    @Column(name = "TAG", length = 500)
    private String tag;

    @Column(name = "LONGITUDE")
    private Double longitude;

    @Column(name = "LATITUDE")
    private Double latitude;

    @Column(name = "REGION1_NAME", length = 150)
    private String region1Name;

    @Column(name = "REGION2_NAME", length = 150)
    private String region2Name;

    @Column(name = "PHOTO_ID")
    private Long photoId;

    @Column(name = "IMAGE_PATH", length = 500)
    private String imagePath;

    @Column(name = "THUMBNAIL_PATH", length = 500)
    private String thumbnailPath;

    @Builder.Default
    @Column(name = "VIEWS_COUNT", nullable = false, columnDefinition = "NUMBER default 0")
    private Long views = 0L;

    @Builder.Default
    @Column(name = "LIKES_COUNT", nullable = false, columnDefinition = "NUMBER default 0")
    private Long likesCount = 0L;

    @Builder.Default
    @Column(name = "BOOKMARKS_COUNT", nullable = false, columnDefinition = "NUMBER default 0")
    private Long bookmarkCount = 0L;

    @Column(name = "STATE", nullable = false, columnDefinition = "NUMBER(1) default 1")
    private int state;

    @Column(name = "HOMEPAGE", length = 500)
    private String homepage;

    @Column(name = "PARKING", length = 2000)
    private String parking;

    @Column(name = "FEE", length = 2000)
    private String fee;

    @Column(name = "HOURS", length = 2000)
    private String hours;

    // ✅ 내부 체크용
    @Transient
    @Builder.Default
    private boolean counterOnlyChanged = false;

    /**
     * ✅ 연관관계: Travel ↔ Like, Bookmark
     **/
    @Builder.Default
    @OneToMany(mappedBy = "travel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Like> likes = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "travel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bookmark> bookmarks = new ArrayList<>();


    /**
     * ✅ 관계 편의 메서드
     **/
    public void addLike(Like like) {
        likes.add(like);
        like.setTravel(this);
        this.likesCount = (this.likesCount == null ? 0 : this.likesCount) + 1;
        this.counterOnlyChanged = true;
    }

    public void removeLike(Like like) {
        likes.remove(like);
        like.setTravel(null);
        this.likesCount = (this.likesCount == null || this.likesCount == 0) ? 0 : this.likesCount - 1;
        this.counterOnlyChanged = true;
    }

    public void addBookmark(Bookmark bookmark) {
        bookmarks.add(bookmark);
        bookmark.setTravel(this);
        this.bookmarkCount = (this.bookmarkCount == null ? 0 : this.bookmarkCount) + 1;
        this.counterOnlyChanged = true;
    }

    public void removeBookmark(Bookmark bookmark) {
        bookmarks.remove(bookmark);
        bookmark.setTravel(null);
        this.bookmarkCount = (this.bookmarkCount == null || this.bookmarkCount == 0) ? 0 : this.bookmarkCount - 1;
        this.counterOnlyChanged = true;
    }


    /**
     * ✅ API 기반 업데이트
     **/
    public void updateFromApi(Travel newTravel) {
        this.title = newTravel.title;
        this.introduction = newTravel.introduction;
        this.description = newTravel.description;
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

    /**
     * ✅ Request DTO 기반 업데이트
     */
    public void updateFromRequest(TravelRequestDTO dto) {
        if (StringUtils.hasText(dto.getContentsCd())) this.contentsCd = dto.getContentsCd();
        if (StringUtils.hasText(dto.getTitle())) this.title = dto.getTitle();
        if (StringUtils.hasText(dto.getIntroduction())) this.introduction = dto.getIntroduction();
        if (StringUtils.hasText(dto.getDescription())) this.description = dto.getDescription(); // ✅ 본문 추가
        if (StringUtils.hasText(dto.getAddress())) this.address = dto.getAddress();
        if (StringUtils.hasText(dto.getRoadAddress())) this.roadAddress = dto.getRoadAddress();
        if (StringUtils.hasText(dto.getPhoneNo())) this.phoneNo = dto.getPhoneNo();
        if (StringUtils.hasText(dto.getTag())) this.tag = dto.getTag();
        if (dto.getLongitude() != null) this.longitude = dto.getLongitude();
        if (dto.getLatitude() != null) this.latitude = dto.getLatitude();
        if (StringUtils.hasText(dto.getCategoryName())) this.categoryName = dto.getCategoryName();
        if (StringUtils.hasText(dto.getRegion1Name())) this.region1Name = dto.getRegion1Name();
        if (StringUtils.hasText(dto.getRegion2Name())) this.region2Name = dto.getRegion2Name();
        this.imagePath = dto.getImagePath();
        this.thumbnailPath = dto.getThumbnailPath();
        if (dto.getThumbnailPath() != null) {
            this.thumbnailPath = dto.getThumbnailPath();
        }
        this.state = dto.getState();
        if (StringUtils.hasText(dto.getHomepage())) this.homepage = dto.getHomepage();
        if (StringUtils.hasText(dto.getParking())) this.parking = dto.getParking();
        if (StringUtils.hasText(dto.getFee())) this.fee = dto.getFee();
        if (StringUtils.hasText(dto.getHours())) this.hours = dto.getHours();
    }

    public void incrementViews() {
        this.views = (this.views == null) ? 1L : this.views + 1;
    }

    public void incrementLikesCount() {
        this.likesCount = (this.likesCount == null) ? 1L : this.likesCount + 1;
    }

    public void decrementLikesCount() {
        this.likesCount = (this.likesCount == null || this.likesCount == 0) ? 0L : this.likesCount - 1;
    }

    public void incrementBookmarkCount() {
        this.bookmarkCount = (this.bookmarkCount == null) ? 1L : this.bookmarkCount + 1;
    }

    public void decrementBookmarkCount() {
        this.bookmarkCount = (this.bookmarkCount == null || this.bookmarkCount == 0) ? 0L : this.bookmarkCount - 1;
    }

    public void setUpdatedAt(LocalDateTime now) {
    }

}