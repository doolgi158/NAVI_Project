package com.navi.planner.repository;

import com.navi.planner.domain.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TravelPlanRepository extends JpaRepository<TravelPlan, Long> {

    // 기본: 유저 문자열 아이디(user.user_id)로 필터
    List<TravelPlan> findByUser_Id(String userId);

    /**
     * 리스트 조회 시 days 까지 한 방에 가져오기 (N+1 방지)
     * distinct로 중복 제거
     */
    @Query("""
           select distinct p
           from TravelPlan p
             join p.user u
             left join fetch p.days d
           where u.id = :userId
           order by p.startDate desc, p.id desc
           """)
    List<TravelPlan> findAllWithDaysByUserId(@Param("userId") String userId);

    /**
     * 단건 상세 조회 + days fetch
     */
    @Query("""
           select p
           from TravelPlan p
             left join fetch p.days d
           where p.id = :id
           """)
    TravelPlan findWithDaysById(@Param("id") Long id);
}
