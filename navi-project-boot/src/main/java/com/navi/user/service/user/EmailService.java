package com.navi.user.service.user;

public interface EmailService {
    void sendVerificationCode(String email);
    boolean verifyCode(String email, String code);
    boolean sendTempPassword(String id, String email);
}
