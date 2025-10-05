package com.navi.user.repository;

import com.navi.user.domain.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // id를 기준으로 User의 데이터를 가져온다.
    @EntityGraph(attributePaths = "roleList")
    @Query("select u from User u where u.id = :id")
    User getUser(@Param("id") String id);

    Optional<User> findByUserId(String userId);
}
