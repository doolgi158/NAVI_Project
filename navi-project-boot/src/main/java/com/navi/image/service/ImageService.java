package com.navi.image.service;

import com.navi.image.domain.Image;
import com.navi.image.dto.ImageDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImageService {
    /** 이미지 업로드 (중복 시 업데이트) */
    ImageDTO uploadImage(MultipartFile file, String targetType, String targetId);

    /** 특정 대상의 모든 이미지 조회 */
    List<ImageDTO> getImagesByTarget(String targetType, String targetId);

    /** 이미지 삭제 */
    void deleteImage(String targetType, String targetId);
}
