package com.NAVI_Project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing // Auditing 기능 켜기 (등록일 수정일 날짜 자동 생성 반영해주는거 삭제X)
@SpringBootApplication
public class NaviProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(NaviProjectApplication.class, args);
	}

}
