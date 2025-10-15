package com.navi.user.service.user;

import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService{
    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final Map<String, String> verificationCodes = new HashMap<>();

    @Override
    public void sendVerificationCode(String email) {
        String code = String.format("%06d", new Random().nextInt(999999)); // 6자리 난수
        verificationCodes.put(email, code);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("[NAVI] 이메일 인증코드");
            helper.setText("""
                <h3>안녕하세요, NAVI 회원님!</h3>
                <p>아래 인증코드를 입력하여 이메일 인증을 완료해주세요.</p>
                <h2 style="color:#007BFF;">%s</h2>
                <p>이 코드는 5분간 유효합니다.</p>
            """.formatted(code), true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("이메일 발송 실패", e);
        }
    }

    @Override
    public boolean verifyCode(String email, String code) {
        return code.equals(verificationCodes.get(email));
    }

    @Override
    @Transactional
    public boolean sendTempPassword(String id, String email) {
        Optional<User> userOpt = userRepository.findByIdAndEmail(id, email);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        String tempPw = generateTempPassword();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            message.setSubject("[NAVI] 임시 비밀번호 안내");
            message.setText("임시 비밀번호는 " + tempPw + " 입니다.\n로그인 후 반드시 비밀번호를 변경해주세요.");
            message.addRecipients(MimeMessage.RecipientType.TO, email);
            mailSender.send(message);

            // 비밀번호 암호화 후 저장
            User updatedUser = user.changePassword(passwordEncoder.encode(tempPw));
            userRepository.save(updatedUser);

            return true;
        } catch (MessagingException e) {
            e.printStackTrace();
            return false;
        }
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
        StringBuilder sb = new StringBuilder();
        Random rnd = new Random();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
