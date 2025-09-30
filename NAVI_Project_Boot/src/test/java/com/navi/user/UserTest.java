package com.navi.user;

import com.navi.user.domain.User;
import com.navi.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@SpringBootTest
public class UserTest {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

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
                .state(User.ProviderType.NORMAL)
                .build();
        userRepository.save(user);
    }
}
