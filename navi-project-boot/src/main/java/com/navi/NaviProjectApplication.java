package com.navi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

//@EnableScheduling //스케줄러 기능 켜기
@EnableJpaAuditing // 등록일/수정일 자동 생성
@SpringBootApplication(scanBasePackages = "com.navi")
public class NaviProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(NaviProjectApplication.class, args);
	}

}
