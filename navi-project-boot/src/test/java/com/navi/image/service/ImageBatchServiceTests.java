package com.navi.image.service;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@Slf4j
@SpringBootTest
class ImageBatchServiceTests {

    @Autowired
    private ImageBatchService imageBatchService;

    /* ✅ 1. 숙소 이미지 초기 등록 (UUID rename 포함) */
    @Test
    void insertAccImagesFromFolder() {
        imageBatchService.insertAccImagesFromFolder();
        log.info("=== 🏨 숙소 이미지 초기 매핑 완료 ===");
    }

    /* ✅ 2. UUID 미적용 이미지 재처리 */
    @Test
    void insertAccImagesOnlyNonUUID() {
        imageBatchService.insertAccImagesOnlyNonUUID();
        log.info("=== 🧩 UUID 미적용 숙소 이미지 재등록 완료 ===");
    }

    /* ✅ 3. 숙소 mainImage 랜덤 배정 (호텔/펜션/일반) */
    @Test
    void assignAccMainImages() {
        imageBatchService.assignAccMainImages();
        log.info("=== ✅ 숙소 mainImage 랜덤 배정 완료 ===");
    }

    /* ✅ 4. 객실 썸네일 랜덤 배정 (room 폴더 기준) */
    @Test
    void assignRoomThumbnails() {
        imageBatchService.assignRoomThumbnails();
        log.info("=== ✅ 객실 썸네일 랜덤 배정 완료 ===");
    }

    /* ✅ 5. 모든 숙소 mainImage 기준으로 강제 썸네일 재생성 */
    @Test
    void regenerateAllThumbnails() {
        imageBatchService.regenerateAllThumbnails();
        log.info("=== ✅ 모든 숙소 썸네일 강제 재생성 완료 ===");
    }

}
