package com.navi.user.repository;

import com.navi.user.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // id를 기준으로 User의 데이터를 가져온다.
    @EntityGraph(attributePaths = "userRoleList")
    @Query("select u from User u where u.id = :id")
    User getUser(@Param("id") String id);

    @Query("select u from User u where u.id = :id")
    Optional<User> findByUserId(@Param("id") String id);

    // 공백 없이 name과 email을 기준으로 User의 데이터를 가져온다.
    Optional<User> findByNameIgnoreCaseAndEmailIgnoreCase(String name, String email);

    Optional<User>findByIdAndEmail(String id, String email);
    Optional<User> findById(String id);     //travel 연동시 필요
    Optional<User> findByEmail(String email);
    boolean existsById(String id);

    // admin user 데이터 불러오기
    Page<User> findByNameContainingIgnoreCaseOrIdContainingIgnoreCase(String name, String id, Pageable pageable);
    Page<User> findByIdContainingIgnoreCase(String id, Pageable pageable);
    Page<User> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);
    Page<User> findByPhoneContainingIgnoreCase(String phone, Pageable pageable);
    Page<User> findBySignUpContaining(String signUp, Pageable pageable);
    Page<User> findByLocal(char local, Pageable pageable);
    Page<User> findByUserStateIgnoreCase(String state, Pageable pageable);
}
