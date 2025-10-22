package com.navi.user;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.repository.AccRepository;
import com.navi.common.enums.RsvStatus;
import com.navi.flight.domain.Flight;
import com.navi.flight.domain.FlightReservation;
import com.navi.flight.domain.Seat;
import com.navi.flight.repository.FlightRepository;
import com.navi.flight.repository.FlightReservationRepository;
import com.navi.flight.repository.SeatRepository;
import com.navi.travel.domain.Travel;
import com.navi.travel.repository.TravelRepository;
import com.navi.user.domain.Log;
import com.navi.user.domain.User;
import com.navi.user.enums.ActionType;
import com.navi.user.enums.UserRole;
import com.navi.user.enums.UserState;
import com.navi.user.repository.LogRepository;
import com.navi.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@SpringBootTest
@Slf4j
public class UserTest {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccRepository accRepository;

    @Autowired
    private TravelRepository travelRepository;

    @Autowired
    private LogRepository logRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private FlightReservationRepository flightReservationRepository;

    @Autowired
    private SeatRepository seatRepository;

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

    // Log 테이블 목데이터 생성
    @Test
    @Transactional
    @Commit
    public void insertDummyLogsForAdminUser() {
        // ✅ user_no=1 고정 (존재하는 사용자만)
        User user = userRepository.findById(1L)
                .orElseThrow(() -> new EntityNotFoundException("user_no=1 사용자를 찾을 수 없습니다."));

        List<Travel> travels = travelRepository.findAll();
        List<Acc> accommodations = accRepository.findAll();

        if (travels.isEmpty() && accommodations.isEmpty()) {
            log.warn("🚨 여행지와 숙소 데이터가 없습니다. 로그를 생성할 수 없습니다.");
            return;
        }

        Random random = new Random();
        List<Log> logs = new ArrayList<>();
        int totalLogs = 0;

        for (int i = 0; i < 5000; i++) { // ✅ 원하는 더미 개수 (ex: 5000개)
            ActionType type = getRandomAction(random);

            Log logEntity = switch (type) {
                case VIEW_TRAVEL -> makeTravelLog(user, type, travels, random);
                case VIEW_ACCOMMODATION -> makeAccLog(user, type, accommodations, random);
                default -> null;
            };

            if (logEntity != null) {
                logs.add(logEntity);
                totalLogs++;
            }

            // 💾 배치 단위로 커밋 (성능 + 안정성)
            if (logs.size() >= 500) {
                logRepository.saveAll(logs);
                logs.clear();
                log.info("💾 {}개 로그 중간 저장 완료", totalLogs);
            }
        }

        if (!logs.isEmpty()) {
            logRepository.saveAll(logs);
        }

        log.info("✅ Log 더미 데이터 삽입 완료: 총 {}개 (user_no=1)", totalLogs);
    }

    // 랜덤 액션 타입 선택
    private ActionType getRandomAction(Random random) {
        ActionType[] actions = {
                ActionType.VIEW_TRAVEL,
                ActionType.VIEW_ACCOMMODATION,
        };
        return actions[random.nextInt(actions.length)];
    }

    // 여행지 관련 로그 생성
    private Log makeTravelLog(User user, ActionType action, List<Travel> travels, Random random) {
        if (travels.isEmpty()) return null;
        Travel t = travels.get(random.nextInt(travels.size()));

        return Log.builder()
                .user(user)
                .actionType(action)
                .targetId(t.getTravelId())
                .targetName(t.getTitle())
                .createdAt(randomDateBetween(LocalDate.of(2025, 5, 1),
                        LocalDate.of(2025, 10, 22), random))
                .build();
    }

    // 숙소 관련 로그 생성
    private Log makeAccLog(User user, ActionType action, List<Acc> accList, Random random) {
        if (accList.isEmpty()) return null;
        Acc acc = accList.get(random.nextInt(accList.size()));

        return Log.builder()
                .user(user)
                .actionType(action)
                .targetId(acc.getAccNo())
                .targetName(acc.getTitle())
                .createdAt(randomDateBetween(LocalDate.of(2025, 5, 1),
                        LocalDate.of(2025, 10, 22), random))
                .build();
    }

    // 8월 1일 ~ 10월 22일 랜덤 시간
    private LocalDateTime randomDateBetween(LocalDate start, LocalDate end, Random random) {
        long days = ChronoUnit.DAYS.between(start, end);
        long randomDays = random.nextLong(days + 1);
        LocalDate randomDate = start.plusDays(randomDays);
        int hour = random.nextInt(24);
        int minute = random.nextInt(60);
        int second = random.nextInt(60);
        return randomDate.atTime(hour, minute, second);
    }

    @Test
    @Transactional
    @Commit
    public void insert5000DummyFlightReservations() {
        // user_no=1 고정
        User user = userRepository.findById(1L)
                .orElseThrow(() -> new EntityNotFoundException("user_no=1 사용자를 찾을 수 없습니다."));

        List<Flight> flights = flightRepository.findAll();
        List<Seat> seats = seatRepository.findAll();

        if (flights.isEmpty() || seats.isEmpty()) {
            log.warn("🚨 항공편 또는 좌석 데이터가 없습니다. 더미 예약을 생성할 수 없습니다.");
            return;
        }

        Random random = new Random();
        List<FlightReservation> reservations = new ArrayList<>();
        int total = 0;

        for (int i = 0; i < 4000; i++) {
            Flight flight = flights.get(random.nextInt(flights.size()));
            Seat seat = seats.get(random.nextInt(seats.size()));

            String frsvId = String.format("F20251022%04d", i + 1);
            RsvStatus status = getRandomStatus(random);
            BigDecimal price = BigDecimal.valueOf(80000 + random.nextInt(300000));

            String passengersJson = makeRandomPassengersJson(random);

            FlightReservation reservation = FlightReservation.builder()
                    .frsvId(frsvId)
                    .user(user)
                    .flight(flight)
                    .seat(seat)
                    .totalPrice(price)
                    .status(status)
                    .passengersJson(passengersJson)
                    .paidAt(status == RsvStatus.PAID
                            ? randomDateBetween(LocalDate.of(2025, 5, 1), LocalDate.of(2025, 10, 22), random).toLocalDate()
                            : null)
                    .build();

            reservations.add(reservation);
            total++;

            // 💾 500개 단위로 중간 저장
            if (reservations.size() >= 500) {
                flightReservationRepository.saveAll(reservations);
                reservations.clear();
                log.info("💾 {}개 중간 저장 완료", total);
            }
        }

        if (!reservations.isEmpty()) {
            flightReservationRepository.saveAll(reservations);
        }

        log.info("✅ FlightReservation 더미 데이터 삽입 완료: 총 {}개 (user_no=1)", total);
    }

    private RsvStatus getRandomStatus(Random random) {
        RsvStatus[] statuses = {
                RsvStatus.PENDING,
                RsvStatus.PAID,
                RsvStatus.CANCELLED,
                RsvStatus.REFUNDED
        };
        return statuses[random.nextInt(statuses.length)];
    }

    // 랜덤 탑승자 JSON 생성
    private String makeRandomPassengersJson(Random random) {
        int count = 1 + random.nextInt(3);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < count; i++) {
            sb.append(String.format(
                    "{\"name\":\"Passenger%d\",\"age\":%d,\"gender\":\"%s\",\"passport\":\"P%d\"}",
                    i + 1,
                    20 + random.nextInt(40),
                    random.nextBoolean() ? "M" : "F",
                    1000000 + random.nextInt(9000000)
            ));
            if (i < count - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}
