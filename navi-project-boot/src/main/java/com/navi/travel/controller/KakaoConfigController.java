//package com.navi.travel.controller;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.util.Collections;
//import java.util.Map;
//
//// 이 코드는 백엔드(Spring Boot) 개발자에게 전달할 예시입니다.
//@RestController
//@RequestMapping("/api/config")
//public class KakaoConfigController {
//
//    @Value("${kakaoAPIKey}") // application.properties 또는 환경 변수에서 읽어옴
//    private String kakaoMapAppKey;
//
//    @GetMapping("/kakao-key")
//    public Map<String, String> getKakaoMapKey() {
//        return Collections.singletonMap("kakaoAPIKey", kakaoMapAppKey);
//    }
//}