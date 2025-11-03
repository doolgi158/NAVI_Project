package com.navi.accommodation.mapper;

import org.apache.ibatis.jdbc.SQL;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/* =============================================================
   SQLProvider : 자바 코드로 SQL을 동적으로 조립하는 역할
   ============================================================= */
public class AccSqlProvider {

    /* =============================================================
       [1] 사용자 숙소 목록 조회 (검색 + 페이징)
       ============================================================= */
    public String buildSearchQuery(Map<String, Object> params) {
        String city = (String) params.get("city");                      // 행정시
        String townshipName = (String) params.get("townshipName");      // 읍면동
        String title = (String) params.get("title");                    // 숙소명
        String checkIn = (String) params.get("checkIn");                // 체크인
        String checkOut = (String) params.get("checkOut");              // 체크아웃
        Integer guestCount = (Integer) params.get("guestCount");        // 투숙 인원
        Integer roomCount = (Integer) params.get("roomCount");          // 객실 수
        String sort = (String) params.get("sort");                      // 정렬 기준
        Integer offset = (Integer) params.get("offset");                // 페이지 시작 인덱스
        Integer pageSize = (Integer) params.get("pageSize");            // 페이지 크기

        // categoryList 안전 캐스팅 처리
        Object rawCategoryList = params.get("categoryList");
        List<String> categoryList = null;
        if (rawCategoryList instanceof List<?>) {
            categoryList = ((List<?>) rawCategoryList)
                    .stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }

        SQL sql = new SQL()
                .SELECT("""
                            a.ACC_NO, 
                            a.ACC_ID AS accId, 
                            a.TITLE, 
                            a.ADDRESS, 
                            a.CATEGORY AS category,
                            a.MAIN_IMAGE AS mainImage, 
                            (SELECT MIN(r2.WEEKDAY_FEE) FROM NAVI_ROOM r2 WHERE r2.ACC_NO = a.ACC_NO) AS minPrice, 
                            (SELECT MAX(r3.WEEKDAY_FEE) FROM NAVI_ROOM r3 WHERE r3.ACC_NO = a.ACC_NO) AS maxPrice
                        """)
                .FROM("NAVI_ACCOMMODATION a")
                .JOIN("NAVI_TOWNSHIP t ON a.TOWNSHIP_ID = t.TOWNSHIP_ID")
                .WHERE("a.IS_ACTIVE = 1");

        // 검색 유형 분리
        if (title != null && !title.isBlank()
                && (city == null || city.isBlank())
                && (townshipName == null || townshipName.isBlank())) {
            sql.WHERE("LOWER(a.TITLE) LIKE '%' || LOWER(#{title}) || '%'");
        } else if ((city != null && !city.isBlank()) || (townshipName != null && !townshipName.isBlank())) {
            if (city != null && !city.isBlank() && townshipName != null && !townshipName.isBlank()) {
                sql.WHERE("(t.SIGUNGU_NAME = #{city} AND t.TOWNSHIP_NAME = #{townshipName})");
            } else if (city != null && !city.isBlank()) {
                sql.WHERE("t.SIGUNGU_NAME = #{city}");
            } else if (townshipName != null && !townshipName.isBlank()) {
                sql.WHERE("t.TOWNSHIP_NAME = #{townshipName}");
            }
        }

        // 카테고리 필터
        if (categoryList != null && !categoryList.isEmpty()) {
            StringBuilder inClause = new StringBuilder("(");
            for (int i = 0; i < categoryList.size(); i++) {
                inClause.append("#{categoryList[").append(i).append("]}");
                if (i < categoryList.size() - 1) inClause.append(", ");
            }
            inClause.append(")");
            sql.WHERE("a.CATEGORY IN " + inClause);
        }

        // 객실 조건
//        if (checkIn != null && checkOut != null) {
//            sql.WHERE("""
//                        EXISTS (
//                          SELECT 1 FROM NAVI_ROOM r
//                          JOIN NAVI_ROOM_STOCK s ON r.ROOM_NO = s.ROOM_NO
//                          WHERE r.ACC_NO = a.ACC_NO
//                            AND s.STOCK_DATE BETWEEN #{checkIn} AND #{checkOut}
//                            AND s.REMAIN_COUNT > 0
//                        )
//                    """);
//        }
        if (guestCount != null) {
            sql.WHERE("EXISTS (SELECT 1 FROM NAVI_ROOM r WHERE r.ACC_NO = a.ACC_NO AND r.MAX_CNT >= #{guestCount})");
        }
        if (roomCount != null) {
            sql.WHERE("EXISTS (SELECT 1 FROM NAVI_ROOM r WHERE r.ACC_NO = a.ACC_NO AND r.ROOM_CNT >= #{roomCount})");
        }

        // 정렬
        switch (sort == null ? "" : sort.toLowerCase()) {
            case "minprice" -> sql.ORDER_BY("minPrice ASC");
            case "maxprice" -> sql.ORDER_BY("maxPrice DESC");
            case "view" -> sql.ORDER_BY("a.VIEW_COUNT DESC");
            case "recent" -> sql.ORDER_BY("a.CREATED_TIME DESC");
            default -> sql.ORDER_BY("a.TITLE ASC");
        }

        String baseQuery = sql.toString();
        if (offset != null && pageSize != null) {
            baseQuery += " OFFSET #{offset} ROWS FETCH NEXT #{pageSize} ROWS ONLY";
        }
        return baseQuery;
    }

    /* =============================================================
       [2] 사용자 숙소 총 개수 조회
       ============================================================= */
    public String buildSearchCountQuery(Map<String, Object> params) {
        String city = (String) params.get("city");
        String townshipName = (String) params.get("townshipName");
        String title = (String) params.get("title");
        String checkIn = (String) params.get("checkIn");
        String checkOut = (String) params.get("checkOut");
        Integer guestCount = (Integer) params.get("guestCount");
        Integer roomCount = (Integer) params.get("roomCount");

        Object rawCategoryList = params.get("categoryList");
        List<String> categoryList = null;
        if (rawCategoryList instanceof List<?>) {
            categoryList = ((List<?>) rawCategoryList)
                    .stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }

        SQL sql = new SQL()
                .SELECT("COUNT(DISTINCT a.ACC_NO)")
                .FROM("NAVI_ACCOMMODATION a")
                .JOIN("NAVI_TOWNSHIP t ON a.TOWNSHIP_ID = t.TOWNSHIP_ID")
                .WHERE("a.IS_ACTIVE = 1");

        if (title != null && !title.isBlank()
                && (city == null || city.isBlank())
                && (townshipName == null || townshipName.isBlank())) {
            sql.WHERE("LOWER(a.TITLE) LIKE '%' || LOWER(#{title}) || '%'");
        } else if ((city != null && !city.isBlank()) || (townshipName != null && !townshipName.isBlank())) {
            if (city != null && !city.isBlank() && townshipName != null && !townshipName.isBlank()) {
                sql.WHERE("(t.SIGUNGU_NAME = #{city} AND t.TOWNSHIP_NAME = #{townshipName})");
            } else if (city != null && !city.isBlank()) {
                sql.WHERE("t.SIGUNGU_NAME = #{city}");
            } else if (townshipName != null && !townshipName.isBlank()) {
                sql.WHERE("t.TOWNSHIP_NAME = #{townshipName}");
            }
        }

        if (categoryList != null && !categoryList.isEmpty()) {
            StringBuilder inClause = new StringBuilder("(");
            for (int i = 0; i < categoryList.size(); i++) {
                inClause.append("#{categoryList[").append(i).append("]}");
                if (i < categoryList.size() - 1) inClause.append(", ");
            }
            inClause.append(")");
            sql.WHERE("a.CATEGORY IN " + inClause);
        }

        if (checkIn != null && checkOut != null) {
            sql.WHERE("""
                        EXISTS (
                          SELECT 1 FROM NAVI_ROOM r 
                          JOIN NAVI_ROOM_STOCK s ON r.ROOM_NO = s.ROOM_NO
                          WHERE r.ACC_NO = a.ACC_NO
                            AND s.STOCK_DATE BETWEEN #{checkIn} AND #{checkOut}
                            AND s.REMAIN_COUNT > 0
                        )
                    """);
        }
        if (guestCount != null) {
            sql.WHERE("EXISTS (SELECT 1 FROM NAVI_ROOM r WHERE r.ACC_NO = a.ACC_NO AND r.MAX_CNT >= #{guestCount})");
        }
        if (roomCount != null) {
            sql.WHERE("EXISTS (SELECT 1 FROM NAVI_ROOM r WHERE r.ACC_NO = a.ACC_NO AND r.ROOM_CNT >= #{roomCount})");
        }

        return sql.toString();
    }

    /* =============================================================
       [3] 관리자 숙소 목록 조회 (기존)
       ============================================================= */
    public String buildAdminListQuery(Map<String, Object> params) {
        String keyword = (String) params.get("keyword");
        Integer sourceType = (Integer) params.get("sourceType");
        String activeFilter = (String) params.get("activeFilter");
        Integer offset = (Integer) params.get("offset");
        Integer pageSize = (Integer) params.get("pageSize");

        SQL sql = new SQL()
                .SELECT("""
                            ACC_NO AS accNo,
                            ACC_ID AS accId,
                            CONTENT_ID AS contentId,
                            TITLE AS title,
                            CATEGORY AS category,
                            TEL AS tel,
                            ADDRESS AS address,
                            MAPX, MAPY,
                            OVERVIEW AS overview,
                            MAIN_IMAGE AS mainImage,
                            CHECKIN_TIME AS checkInTime,
                            CHECKOUT_TIME AS checkOutTime,
                            HAS_COOKING AS hasCooking,
                            HAS_PARKING AS hasParking,
                            IS_ACTIVE AS isActive,
                            VIEW_COUNT AS viewCount,
                            TO_CHAR(CREATED_TIME, 'YYYY-MM-DD HH24:MI') AS createdTime,
                            TO_CHAR(MODIFIED_TIME, 'YYYY-MM-DD HH24:MI') AS modifiedTime
                        """)
                .FROM("NAVI_ACCOMMODATION")
                .WHERE("1=1");

        if (keyword != null && !keyword.isBlank()) {
            sql.WHERE("(LOWER(TITLE) LIKE '%' || LOWER(#{keyword}) || '%' OR LOWER(ADDRESS) LIKE '%' || LOWER(#{keyword}) || '%')");
        }
        if (sourceType != null) {
            if (sourceType == 0) sql.WHERE("CONTENT_ID IS NULL");
            else if (sourceType == 1) sql.WHERE("CONTENT_ID IS NOT NULL");
        }
        if (activeFilter != null && !"ALL".equalsIgnoreCase(activeFilter)) {
            if ("ACTIVE".equalsIgnoreCase(activeFilter)) sql.WHERE("IS_ACTIVE = 1");
            else if ("INACTIVE".equalsIgnoreCase(activeFilter)) sql.WHERE("IS_ACTIVE = 0");
        }

        sql.ORDER_BY("ACC_NO DESC");

        String baseQuery = sql.toString();
        if (offset != null && pageSize != null) {
            baseQuery += " OFFSET #{offset} ROWS FETCH NEXT #{pageSize} ROWS ONLY";
        }

        return baseQuery;
    }

    /* =============================================================
       [4] 관리자 숙소 개수 조회 (기존)
       ============================================================= */
    public String buildAdminCountQuery(Map<String, Object> params) {
        String keyword = (String) params.get("keyword");
        Integer sourceType = (Integer) params.get("sourceType");
        String activeFilter = (String) params.get("activeFilter");

        SQL sql = new SQL()
                .SELECT("COUNT(*)")
                .FROM("NAVI_ACCOMMODATION")
                .WHERE("1=1");

        if (keyword != null && !keyword.isBlank()) {
            sql.WHERE("(LOWER(TITLE) LIKE '%' || LOWER(#{keyword}) || '%' OR LOWER(ADDRESS) LIKE '%' || LOWER(#{keyword}) || '%')");
        }
        if (sourceType != null) {
            if (sourceType == 0) sql.WHERE("CONTENT_ID IS NULL");
            else if (sourceType == 1) sql.WHERE("CONTENT_ID IS NOT NULL");
        }
        if (activeFilter != null && !"ALL".equalsIgnoreCase(activeFilter)) {
            if ("ACTIVE".equalsIgnoreCase(activeFilter)) sql.WHERE("IS_ACTIVE = 1");
            else if ("INACTIVE".equalsIgnoreCase(activeFilter)) sql.WHERE("IS_ACTIVE = 0");
        }

        return sql.toString();
    }
}