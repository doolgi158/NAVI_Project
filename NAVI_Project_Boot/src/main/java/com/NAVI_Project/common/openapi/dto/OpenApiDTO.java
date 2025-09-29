package com.NAVI_Project.common.openapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OpenApiDTO {
    private String siteName; //요청할 사이트 이름(합쳐진 최종본 URL)
    private String method; //전송 방식(GET, POST)
}
