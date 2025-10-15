package com.navi.user.repository;

import com.navi.user.domain.User;
import com.navi.user.domain.Withdraw;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WithdrawRepository extends JpaRepository<Withdraw, Long> {
    Optional<Withdraw> findByUser(User user);
}
