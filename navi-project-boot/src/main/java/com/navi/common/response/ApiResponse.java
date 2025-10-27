package com.navi.common.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
public class ApiResponse<T> {   //
    private int status;                 // HTTP 상태 코드
    private String message;             // 처리 결과 메시지
    private T data;                     // 데이터
    private String timestamp;    // 응답 시간

    public ApiResponse(String message, int status, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    // 성공 응답
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("SUCCESS", 200, data);
    }

    // 실패 응답
    public static <T> ApiResponse<T> error(String message, int status, T data) {
        return new ApiResponse<>(message, status, data);
    }
}
