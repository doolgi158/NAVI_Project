package com.NAVI_Project.travel.service;

import com.NAVI_Project.common.openapi.URLConnectUtil;
import com.NAVI_Project.common.openapi.dto.OpenApiDTO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TravelServiceImpl implements TravelService {

    @Value("${api.travel.key}")
    private String travelApiKey;

    @Override
    public String jejuSpotList() {
        try{
            String baseUrl = "https://api.visitjeju.net/vsjApi/contents/searchList";
            String params = String.format("apiKey=%s&locale=kr",travelApiKey);
            String site = baseUrl + params;

            OpenApiDTO openApi = new OpenApiDTO(site,"GET");
            return URLConnectUtil.openAPIData(openApi).toString();
        } catch(Exception e){
            return "API 호출 중 오류 발생";
        }
    }
}
