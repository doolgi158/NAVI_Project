package com.navi.common.util;

import lombok.Getter;

@Getter
public class CustomException extends RuntimeException {
    private final int status;
    private final Object data;

    public CustomException(String message, int status, Object data) {
        super(message);
        this.status = status;
        this.data = data;
    }
}
