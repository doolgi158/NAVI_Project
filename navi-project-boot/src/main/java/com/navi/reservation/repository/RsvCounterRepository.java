package com.navi.reservation.repository;

import com.navi.reservation.domain.RsvCounter;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RsvCounterRepository extends JpaRepository<RsvCounter, RsvCounter.PK> {
    /* 관리자 기능 */
    // 특정 날짜/유형 카운터 직접 조회
    @Query("SELECT c FROM RsvCounter c WHERE c.counterDate = :date AND c.targetType = :type")
    Optional<RsvCounter> findById(
            @Param("date") String date,
            @Param("type") String type
    );

    /* 예약번호 생성용 */
    @Lock(LockModeType.PESSIMISTIC_WRITE)   // 중복 번호 방지를 위한 락 사용
    @Query("SELECT c FROM RsvCounter c WHERE c.counterDate = :date AND c.targetType = :type")
    Optional<RsvCounter> findByIdForUpdate(
            @Param("date") String date,
            @Param("type") String type
    );
}
