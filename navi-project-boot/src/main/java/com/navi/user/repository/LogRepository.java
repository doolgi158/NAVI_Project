package com.navi.user.repository;

import com.navi.user.domain.Log;
import com.navi.user.enums.ActionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface LogRepository extends JpaRepository<Log, Long> {
    long countByActionTypeAndCreatedAtBetween(ActionType actionType, LocalDateTime start, LocalDateTime end);
}
