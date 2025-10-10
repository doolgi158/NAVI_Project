package com.navi.reservation.config;

import com.siot.IamportRestClient.IamportClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ====================================
 * [IamportClientConfig]
 * : PortOne(아임포트) REST API 연동 설정
 * ====================================
 * ㄴ 아임포트 API 인증키를 이용해 PortOne 서버와 통신 가능한
 *    IamportClient 객체를 스프링 Bean으로 등록한다.
 *    (결제 검증, 결제 취소 등에서 재사용)
 */

@Slf4j
@Configuration
public class IamportClientConfig {
    @Value("${iamport.api.key}")
    private String apiKey;

    @Value("${iamport.api.secret}")
    private String apiSecret;

    /** 아임포트 클라이언트 Bean 등록 */
    @Bean
    public IamportClient iamportClient() {
        if (apiKey == null || apiSecret == null) {
            log.error("[IamportClientConfig] API Key 또는 Secret이 설정되지 않았습니다.");
            throw new IllegalStateException("Iamport API 설정 누락");
        }

        log.info("[IamportClientConfig] IamportClient Bean 등록 완료");
        return new IamportClient(apiKey, apiSecret);
    }
}
