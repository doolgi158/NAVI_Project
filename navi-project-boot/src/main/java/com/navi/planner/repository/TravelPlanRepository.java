package com.navi.planner.repository;

import com.navi.planner.domain.TravelPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TravelPlanRepository extends JpaRepository<TravelPlan, Long> {

    @Query("""
    select distinct p from TravelPlan p
      left join fetch p.days d
      left join fetch d.items i
      left join fetch p.user u
    where u.id = :userId
    """)
    List<TravelPlan> findAllWithDaysAndItemsByUserId(@Param("userId") String userId);

    @Query("""
    select p from TravelPlan p
      left join fetch p.days d
      left join fetch d.items i
      left join fetch p.user u
    where p.planId = :planId
    """)
    Optional<TravelPlan> findByIdWithDaysAndItems(@Param("planId") Long planId);

    /** ✅ 전체 유저의 여행계획 목록 (관리자용) */
    Page<TravelPlan> findAll(Pageable pageable);


    Page<TravelPlan> findByTitleContainingIgnoreCaseOrUser_NameContainingIgnoreCase(
            String title,
            String name,
            Pageable pageable
    );

}
