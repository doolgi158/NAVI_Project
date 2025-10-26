package com.navi.common.config.kakao;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor     // 선언된 필드의 선언 순서 그대로 생성자의 파라미터를 생성하기 때문에 필드 순서 중요
public class GeoResult {
    private BigDecimal mapx;
    private BigDecimal mapy;
    private String townshipName;
    private String category;

    public GeoResult(BigDecimal mapx, BigDecimal mapy, String townshipName) {
        this(mapx, mapy, townshipName, null);
    }
}