package com.navi.accommodation.mapper;

import com.navi.accommodation.dto.api.AdminAccListDTO;
import com.navi.accommodation.dto.response.AccListResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.SelectProvider;

import java.util.List;

/* 숙소 검색용 MyBatis 매퍼 */
@Mapper
public interface AccMapper {
    /* 사용자용: 숙소 목록 필터 조회 */
    @SelectProvider(type = AccSqlProvider.class, method = "buildSearchQuery")
    List<AccListResponseDTO> searchAccommodations(
            @Param("city") String city,
            @Param("townshipName") String townshipName,
            @Param("title") String title,
            @Param("categoryList") List<String> categoryList,
            @Param("checkIn") String checkIn,
            @Param("checkOut") String checkOut,
            @Param("guestCount") int guestCount,
            @Param("roomCount") Integer roomCount,
            @Param("sort") String sort,
            @Param("offset") int offset,
            @Param("pageSize") int pageSize
    );

    @SelectProvider(type = AccSqlProvider.class, method = "buildSearchCountQuery")
    int countAccommodations(
            @Param("city") String city,
            @Param("townshipName") String townshipName,
            @Param("title") String title,
            @Param("categoryList") List<String> categoryList,
            @Param("checkIn") String checkIn,
            @Param("checkOut") String checkOut,
            @Param("guestCount") int guestCount,
            @Param("roomCount") Integer roomCount
    );

    /* 관리자용: 숙소 목록 필터 조회 */
    @SelectProvider(type = AccSqlProvider.class, method = "buildAdminListQuery")
    List<AdminAccListDTO> findAllWithFilters(
            @Param("keyword") String keyword,
            @Param("sourceType") Integer sourceType,
            @Param("activeFilter") String activeFilter,
            @Param("offset") int offset,
            @Param("pageSize") int pageSize
    );

    /* 관리자용: 총 개수 조회 */
    @SelectProvider(type = AccSqlProvider.class, method = "buildAdminCountQuery")
    int countAllWithFilters(
            @Param("keyword") String keyword,
            @Param("sourceType") Integer sourceType,
            @Param("activeFilter") String activeFilter
    );
}