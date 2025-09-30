package com.navi.user;

import com.navi.user.enums.UserState;
import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.SecureRandom;
import java.util.Random;

@Slf4j
@SpringBootTest
public class UserTest {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    // 관리자 만들기
    @Test
    public void CreateAdmin(){
        User user = User.builder()
                .name("NAVI")
                .phone("01012341234")
                .birth("2025-08-29")
                .email("enfrlwlapdlf@gmail.com")
                .perNum(passwordEncoder.encode("2508293123456"))
                .ID("naviadmin")
                .PW(passwordEncoder.encode("skqlAdmin1234!"))
                .userState(UserState.NORMAL)
                .build();
        userRepository.save(user);
    }

    // 사용자 만들기
    @Test
    public void Insertuser() {
        Random random = new Random();
        SecureRandom secureRandom = new SecureRandom();
        StringBuilder phone = new StringBuilder();
        StringBuilder personal = new StringBuilder();
        StringBuilder password = new StringBuilder();
        UserState[] values = UserState.values();

        for(int i = 0; i <= 100; i++) {
            for (int j = 0; j < 8; j++) {
                phone.append(random.nextInt(10));
            }
            for (int j = 0; j < 13; j++) {
                personal.append(random.nextInt(10));
            }
            password.append("user").append(i).append("!");

            UserState state = values[random.nextInt(values.length)];
            int phonenum = 10000000 + random.nextInt(90000000);

            User user = User.builder()
                    .name("user" + i)
                    .phone("010" + phonenum)
                    .birth(phone.toString())
                    .email("user" + i + "@naver.com")
                    .perNum(passwordEncoder.encode(personal.toString()))
                    .ID("navi" + i)
                    .PW(passwordEncoder.encode(password.toString()))
                    .userState(state)
                    .build();
            userRepository.save(user);
            phone.setLength(0);
            personal.setLength(0);
            password.setLength(0);
        }
    }
}
