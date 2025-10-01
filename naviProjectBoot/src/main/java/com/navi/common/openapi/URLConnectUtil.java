package com.navi.common.openapi;

import com.navi.common.openapi.dto.OpenApiDTO;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Slf4j
public class URLConnectUtil {
    public static StringBuilder openAPIData(OpenApiDTO api) throws Exception {
        HttpURLConnection conn = null;

        try{
            URI uri = new URI(api.getSiteName());
            URL url = uri.toURL();
            conn = (HttpURLConnection) url.openConnection(); // API 서버에 요청 보낼 주소

            conn.setRequestMethod(api.getMethod()); //요청 방식 설정

            int responseCode = conn.getResponseCode(); //응답 코드 저장
            log.info("응답코드 : {}", responseCode);

            InputStream inputStream = responseCode >= 200 && responseCode < 300 //200 ~ 299 정상, 그외는 오류 코드
                    ? conn.getInputStream() : conn.getErrorStream(); //성공시 inputStream으로 읽기, 실패시 에러코드 읽기

            // 바이트 형식으로 읽은뒤 -> 문자열로 읽고 -> 스트림형태로 읽어서 처리
            try(BufferedReader in = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))){
                String inputLine;
                StringBuilder output = new StringBuilder();
                while ((inputLine = in.readLine()) != null) { // BufferedReader 통해 반환값 한줄씩 읽어서 output에 저장
                    output.append(inputLine);
                }
                return output;
            }
        }finally {
            if(conn != null){ //null이 아닐경우에만 연결 해제하기
                conn.disconnect();
            }  
        }
    }
}
