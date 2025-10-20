package com.navi.user;

import com.navi.user.domain.User;
import com.navi.user.enums.UserRole;
import com.navi.user.enums.UserState;
import com.navi.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Month;
import java.util.List;
import java.util.Random;

@SpringBootTest
public class UserTest {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager em;

    private final Random random = new Random();

    // 이름 Pool (남녀 각각 50명, 총 100명 이상)
    private static final List<String> NAMES = List.of(
            "김민준", "이서연", "박지호", "최지우", "정하윤", "한지민", "윤예준", "서지호", "권도윤", "신유진",
            "김도윤", "이하은", "박시후", "최하준", "정예린", "한지호", "윤서윤", "서하준", "권민서", "신도윤",
            "오하린", "유지호", "배수아", "백지훈", "홍민지", "문하늘", "정승우", "임채원", "조윤호", "장소율",
            "전도영", "남지안", "노유나", "류성호", "양도윤", "정서우", "윤민재", "김하율", "이시은", "박연우",
            "이준혁", "정유진", "송지환", "조나윤", "안도하", "오지후", "김서아", "문지후", "서지민", "한예준",
            "심지유", "최태윤", "허지후", "신나연", "김하늘", "박수호", "이재윤", "정도윤", "윤태민", "임하린",
            "백수민", "오채린", "류하윤", "송태현", "조하린", "홍예린", "박지유", "김유정", "이준호", "정하은",
            "한민재", "윤서진", "권지윤", "서예은", "임서율", "김도현", "오지민", "박하윤", "이유진", "전예찬",
            "이수민", "박재원", "김윤호", "홍지후", "문도현", "임태민", "남지후", "노하린", "정도영", "류지호",
            "양유나", "조태훈", "백지호", "유서우", "배하린", "홍예준"
    );

    private static final String[] LOCALS = {"L", "F"};
    private static final String[] GENDERS = {"M", "F"};
    private static final UserState[] STATES = UserState.values();
    private static final String[] EMAIL_DOMAINS = {"naver.com", "gmail.com", "daum.net", "kakao.com"};

    private String randomPhone() {
        return "010" + (1000 + random.nextInt(9000)) + (1000 + random.nextInt(9000));
    }

    private String randomBirth() {
        int year = 1980 + random.nextInt(25);
        int month = 1 + random.nextInt(12);
        int day = 1 + random.nextInt(28);
        return String.format("%04d-%02d-%02d", year, month, day);
    }

    private String randomEmail(String userId) {
        return userId + "@" + EMAIL_DOMAINS[random.nextInt(EMAIL_DOMAINS.length)];
    }

    private LocalDateTime randomSignUpDate() {
        int year = 2020 + random.nextInt(6); // 2020~2025
        int month = 1 + random.nextInt(12);
        int day = 1 + random.nextInt(28);
        int hour = random.nextInt(24);
        int minute = random.nextInt(60);
        int second = random.nextInt(60);
        return LocalDateTime.of(year, Month.of(month), day, hour, minute, second);
    }

    // 관리자 만들기
    @Test
    public void CreateAdmin() {
        User user = User.builder()
                .name("NAVI")
                .phone("01012341234")
                .birth("2025-08-29")
                .email("enfrlwlapdlf@gmail.com")
                .id("asdf")
                .pw(passwordEncoder.encode("asdf"))
                .userState(UserState.NORMAL)
                .build();
        user.addRole(UserRole.ADMIN);
        userRepository.save(user);
    }

    // 사용자 만들기
    @Test
    public void createMockUsers() {
        for (int i = 1; i <= 1000; i++) {
            String userId = "navi" + i;
            String rawPw = "user" + i;

            User user = User.builder()
                    .name(NAMES.get(random.nextInt(NAMES.size())))
                    .phone(randomPhone())
                    .birth(randomBirth())
                    .email(randomEmail(userId))
                    .id(userId)
                    .pw(passwordEncoder.encode(rawPw))
                    .gender(GENDERS[random.nextInt(GENDERS.length)])
                    .local(LOCALS[random.nextInt(LOCALS.length)])
                    .signUp(randomSignUpDate())
                    .userState(STATES[random.nextInt(STATES.length)])
                    .build();

            user.addRole(UserRole.USER);

            userRepository.save(user);

            if (i % 100 == 0) {
                System.out.println("✅ " + i + "명의 유저 생성 완료 (" + LocalDateTime.now() + ")");
            }
        }

        System.out.println("🎉 총 1000명의 랜덤 유저 생성 완료!");
    }

    @Test
    @Transactional
    public void insertRolesOnly() {
        // 기존 권한 싹 제거
        em.createNativeQuery("DELETE FROM navi_user_roles").executeUpdate();

        // 새 권한 부여
        for (int i = 0; i <= 1000; i++) {
            String role = (i == 0) ? "ADMIN" : "USER";
            em.createNativeQuery("INSERT INTO navi_user_roles (user_no, role) VALUES (:userNo, :role)")
                    .setParameter("userNo", i)
                    .setParameter("role", role)
                    .executeUpdate();
        }
        System.out.println("✅ 모든 유저 권한 설정 완료");
    }
}
