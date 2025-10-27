//package com.navi.travel.repository.admin;
//
//import com.navi.travel.domain.Travel;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//@Repository
//public interface AdminTravelRepository extends JpaRepository<Travel, Long> {
//
//    /** ✅ 제목, 지역명, 태그 검색용 */
//    Page<Travel> findByTitleContainingIgnoreCaseOrRegion1NameContainingIgnoreCaseOrRegion2NameContainingIgnoreCaseOrTagContainingIgnoreCase(
//            String title, String region1, String region2, String tag, Pageable pageable
//    );
//}
