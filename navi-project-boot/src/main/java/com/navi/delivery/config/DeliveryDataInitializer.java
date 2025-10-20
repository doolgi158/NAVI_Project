// src/main/java/com/navi/delivery/config/DeliveryDataInitializer.java
package com.navi.delivery.config;

import com.navi.delivery.domain.Bag;
import com.navi.delivery.repository.BagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeliveryDataInitializer implements ApplicationRunner {

    private final BagRepository bagRepository;

    @Override
    public void run(ApplicationArguments args) {
        long count = bagRepository.count();

        if (count == 0) {
            bagRepository.save(Bag.builder()
                    .bagCode("S")
                    .bagName("소형(S)")
                    .price(10000)
                    .build());

            bagRepository.save(Bag.builder()
                    .bagCode("M")
                    .bagName("중형(M)")
                    .price(15000)
                    .build());

            bagRepository.save(Bag.builder()
                    .bagCode("L")
                    .bagName("대형(L)")
                    .price(20000)
                    .build());

           // log.info("[DeliveryDataInitializer] 기본 BAG 데이터 3건 자동 삽입 완료");
        } else {
           // log.info("[DeliveryDataInitializer] BAG 테이블에 이미 데이터 존재 (" + count + "건)");
        }
    }
}
