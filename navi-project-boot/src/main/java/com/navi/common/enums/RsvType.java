package com.navi.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RsvType {
    ACC(true),      // 숙소
    FLY(true),      // 항공
    DLV(false);     // 짐배송

    private final boolean holdBeforeConfirm;
}
