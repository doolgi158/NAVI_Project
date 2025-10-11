package com.navi.reservation.domain.enums;

public enum PaymentMethod {
    KAKAOPAY,
    TOSSPAYMENTS,
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