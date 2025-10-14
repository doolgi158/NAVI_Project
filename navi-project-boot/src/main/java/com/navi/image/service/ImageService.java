package com.navi.image.service;

import com.navi.image.domain.Image;
import org.springframework.web.multipart.MultipartFile;

public interface ImageService {
    Image uploadUserProfile(MultipartFile file, Long userNo);
}
