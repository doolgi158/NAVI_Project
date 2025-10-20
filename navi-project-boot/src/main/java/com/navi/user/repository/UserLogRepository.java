package com.navi.user.repository;

import com.navi.user.domain.Log;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserLogRepository extends JpaRepository<Log, Long> {
}
