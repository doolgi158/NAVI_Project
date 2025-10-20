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

    @Test
    void insertAccImagesFromFolder() {
        imageBatchService.insertAccImagesFromFolder();
        log.info("=== 숙소 초기 이미지 매핑 완료 ===");
    }

    @Test
    void testInsertOnlyNonUUID() {
        imageBatchService.insertAccImagesOnlyNonUUID();
    }
}
