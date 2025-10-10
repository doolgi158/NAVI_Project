package com.navi.common.config.kakao;

import lombok.*;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class GeoResult {
    private BigDecimal mapy;
    private BigDecimal mapx;
    private String townshipName;
}
