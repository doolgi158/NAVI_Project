package com.navi.accommodation.controller;

import com.navi.accommodation.service.AccGeoPreviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AccGeoPreviewController {

    private final AccGeoPreviewService accGeoPreviewService;

    /** === Kakao Geo 변환 미리보기 === */
    @GetMapping("/geo/preview")
    public String previewGeo() {
        return accGeoPreviewService.previewAllGeoData();
    }
}
