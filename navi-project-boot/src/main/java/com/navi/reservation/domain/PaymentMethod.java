package com.navi.reservation.domain;

public enum PaymentMethod {
    KAKAOPAY,
    TOSSPAYMENTS,
    NAVERPAY,
    CARD,
    ETC; // 기타

    public static PaymentMethod from(String value) {
        try {
            return PaymentMethod.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ETC;
        }
    }
}
