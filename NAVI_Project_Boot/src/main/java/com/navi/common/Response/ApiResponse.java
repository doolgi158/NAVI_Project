<<<<<<<< HEAD:naviProjectBoot/src/main/java/com/navi/common/response/ApiResponse.java
package com.navi.common.response;
========
package com.navi.common.Response;
>>>>>>>> ced1df1312dfc51a7344e267650a76e6c46e525a:NAVI_Project_Boot/src/main/java/com/navi/common/Response/ApiResponse.java

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApiResponse<T> {   //
    private int status;                 // HTTP 상태 코드
    private String message;             // 처리 결과 메시지
    private T data;                     // 데이터
    private LocalDateTime timestamp;    // 응답 시간

    public ApiResponse(int status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    // 성공 응답
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "SUCCESS", data);
    }

    // 실패 응답
    public static <T> ApiResponse<T> error(String message, int status, T data) {
        return new ApiResponse<>(status, message, data);
    }
}
