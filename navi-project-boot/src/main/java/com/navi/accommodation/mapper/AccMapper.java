package com.navi.accommodation.mapper;

import com.navi.accommodation.domain.Acc;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.SelectProvider;

import java.time.LocalDate;
import java.util.List;

/* 숙소 검색용 MyBatis 매퍼 */
@Mapper
public interface AccMapper {
    // 숙소 검색 (지역/숙소명 + 날짜 + 인원 + 카테고리 + 정렬 조건)
    @SelectProvider(type = AccSqlProvider.class, method = "buildSearchQuery")
    List<Acc> searchAccommodations(
            @Param("city") String city,
            @Param("townshipName") String townshipName,
            @Param("title") String title,
            @Param("categoryList") List<String> categoryList,
            @Param("checkIn") String checkIn,
            @Param("checkOut") String checkOut,
            @Param("guestCount") int guestCount,
            @Param("roomCount") Integer roomCount,
            @Param("sort") String sort
    );
}
