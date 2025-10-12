package com.navi.reservation.repository;

import com.navi.reservation.domain.RsvCounter;
import com.navi.reservation.domain.enums.RsvType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RsvCounterRepository extends JpaRepository<RsvCounter, RsvCounter.PK> {
    /** 예약번호 생성용 */
    @Lock(LockModeType.PESSIMISTIC_WRITE)   // 동시 예약번호 생성 방지
    @Query("SELECT c FROM RsvCounter c WHERE c.counterDate = :date AND c.rsvType = :type")
    Optional<RsvCounter> findByKeyForUpdate(
            @Param("date") String date,
            @Param("type") RsvType type
    );
}

