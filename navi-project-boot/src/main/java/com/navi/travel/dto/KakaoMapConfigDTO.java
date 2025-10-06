package com.navi.travel.dto;

public class KakaoMapConfigDTO {
    private String appkey;
    private String sdkUrl;

    // 생성자, Getter/Setter 생략 (Lombok 사용 권장)
    public KakaoMapConfigDTO(String appkey, String sdkUrl) {
        this.appkey = appkey;
        this.sdkUrl = sdkUrl;
    }

    public String getAppkey() { return appkey; }
    public String getSdkUrl() { return sdkUrl; }

}