//package com.navi.travel.controller;
//
//import com.navi.travel.config.KakaoMapProperties;
//import com.navi.travel.dto.KakaoMapConfigDTO;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/api/config")
//@RequiredArgsConstructor
//public class ConfigController {
//
//    private final KakaoMapProperties kakaoMapProperties;
//
//    @GetMapping("/kakao")
//    public ResponseEntity<KakaoMapConfigDTO> getKakaoMapConfig() {
//        KakaoMapConfigDTO config = new KakaoMapConfigDTO(
//                kakaoMapProperties.getAppkey(),
//                kakaoMapProperties.getSdkUrl()
//        );
//        return ResponseEntity.ok(config);
//    }
//}