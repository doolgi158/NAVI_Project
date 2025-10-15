package com.navi.user.repository;

import com.navi.image.domain.Image;
import com.navi.user.domain.User;
import com.navi.user.enums.UserState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // 시큐리티 로그인용 (Role 함께 불러오기)
    @EntityGraph(attributePaths = "userRoleList")
    @Query("select u from User u where u.id = :id")
    User getUser(@Param("id") String id);

    // 아이디로 조회 (문자열 기반)
    @Query("select u from User u where u.id = :id")
    Optional<User> findByUserId(@Param("id") String id);

    // 이름+이메일로 찾기
    Optional<User> findByNameIgnoreCaseAndEmailIgnoreCase(String name, String email);

    // 아이디+이메일
    Optional<User> findByIdAndEmail(String id, String email);
    Optional<User> findById(String id);     //travel 연동시 필요

    // 이메일
    Optional<User> findByEmail(String email);

    // 아이디 존재 여부
    boolean existsById(String id);

    // 관리자용 검색
    Page<User> findByNameContainingIgnoreCaseOrIdContainingIgnoreCase(String name, String id, Pageable pageable);
    Page<User> findByIdContainingIgnoreCase(String id, Pageable pageable);
    Page<User> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);
    Page<User> findByPhoneContainingIgnoreCase(String phone, Pageable pageable);

    // 가입일 문자열 검색 (TO_CHAR)
    @Query(
            value = "SELECT * FROM navi_users WHERE TO_CHAR(user_signup, 'YYYY-MM-DD') LIKE '%' || :signUp || '%'",
            countQuery = "SELECT COUNT(*) FROM navi_users WHERE TO_CHAR(user_signup, 'YYYY-MM-DD') LIKE '%' || :signUp || '%'",
            nativeQuery = true
    )
    Page<User> findBySignUpContaining(@Param("signUp") String signUp, Pageable pageable);

    // 내/외국인 (String 타입)
    Page<User> findByLocal(String local, Pageable pageable);

    // 유저 상태
    Page<User> findByUserState(UserState state, Pageable pageable);

    // 프로필 이미지 조회용
    Optional<User> findByNo(Long userNo);
    void deleteByNo(Long userNo);
}