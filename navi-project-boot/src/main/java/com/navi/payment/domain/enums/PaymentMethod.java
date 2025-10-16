package com.navi.payment.domain.enums;

public enum PaymentMethod {
    KGINIPAY,
    KAKAOPAY,
    TOSSPAY,
    ETC; // 기타

    public static PaymentMethod from(String value) {
        try {
            return PaymentMethod.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ETC;
        }
    }
}