package com.navi.user.service.user;

public interface EmailService {
    public void sendVerificationCode(String email);
    public boolean verifyCode(String email, String code);
    public boolean sendTempPassword(String id, String email);
}
