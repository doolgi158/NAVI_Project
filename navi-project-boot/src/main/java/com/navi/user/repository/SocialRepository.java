package com.navi.user.repository;

import com.navi.user.domain.Social;
import com.navi.user.domain.User;
import com.navi.user.enums.SocialState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SocialRepository extends JpaRepository<Social, Long> {
    Optional<Social> findByUser(User user);
}
