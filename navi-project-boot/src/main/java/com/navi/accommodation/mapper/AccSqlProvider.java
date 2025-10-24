package com.navi.accommodation.mapper;

import org.apache.ibatis.jdbc.SQL;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/* SQLProvider : 자바 코드로 SQL을 동적으로 조립하는 역할 */
public class AccSqlProvider {

    public String buildSearchQuery(Map<String, Object> params) {
        /* 프론트에서 전달되는 파라미터와 정확히 매칭 */
        String city = (String) params.get("city");                      // 💡 행정시
        String townshipName = (String) params.get("townshipName");      // 💡 읍면동
        String title = (String) params.get("title");                    // 💡 숙소명
        String checkIn = (String) params.get("checkIn");                // 💡 체크인
        String checkOut = (String) params.get("checkOut");              // 💡 체크아웃
        Integer guestCount = (Integer) params.get("guestCount");        // 💡 투숙 인원
        Integer roomCount = (Integer) params.get("roomCount");          // 💡 객실 수
        String sort = (String) params.get("sort");                      // 💡 정렬 기준

        /* categoryList 안전 캐스팅 처리 */
        Object rawCategoryList = params.get("categoryList");
        List<String> categoryList = null;
        if (rawCategoryList instanceof List<?>) {
            categoryList = ((List<?>) rawCategoryList)
                    .stream()
                    .map(Object::toString)
                    .toList();
        }

        /* SQL 빌더 생성 */
        SQL sql = new SQL()
                .SELECT("a.ACC_NO, a.ACC_ID AS accId, a.TITLE, a.ADDRESS, a.MAIN_IMAGE, " +
                        "(SELECT MIN(r2.WEEKDAY_FEE) FROM NAVI_ROOM r2 WHERE r2.ACC_NO = a.ACC_NO) AS MIN_PRICE, " +
                        "(SELECT MAX(r3.WEEKDAY_FEE) FROM NAVI_ROOM r3 WHERE r3.ACC_NO = a.ACC_NO) AS MAX_PRICE")
                .FROM("NAVI_ACCOMMODATION a")
                .JOIN("NAVI_TOWNSHIP t ON a.TOWNSHIP_ID = t.TOWNSHIP_ID")
                .WHERE("a.IS_ACTIVE = 1");

        /* 지역 조건 필터 */
        if (city != null && !city.isBlank()) {
            sql.WHERE("t.SIGUNGU_NAME = #{city}");
        }
        if (townshipName != null && !townshipName.isBlank()) {
            sql.WHERE("t.TOWNSHIP_NAME = #{townshipName}");
        }

        /* 숙소명 검색 조건 */
        if (title != null && !title.isBlank()) {
            sql.WHERE("LOWER(a.TITLE) LIKE '%' || LOWER(#{title}) || '%'");
        }

        /* 카테고리 필터 */
        if (categoryList != null && !categoryList.isEmpty()) {
            StringBuilder inClause = new StringBuilder("(");
            for (int i = 0; i < categoryList.size(); i++) {
                inClause.append("#{categoryList[").append(i).append("]}");
                if (i < categoryList.size() - 1) inClause.append(", ");
            }
            inClause.append(")");
            sql.WHERE("a.CATEGORY IN " + inClause);
        }

        // 객실 조건: 재고, 인원, 날짜
        if (checkIn != null && checkOut != null) {
            sql.WHERE("EXISTS (SELECT 1 FROM NAVI_ROOM r " +
                    "JOIN NAVI_ROOM_STOCK s ON r.ROOM_NO = s.ROOM_NO " +
                    "WHERE r.ACC_NO = a.ACC_NO " +
                    "AND s.STOCK_DATE BETWEEN #{checkIn} AND #{checkOut} " +
                    "AND s.REMAIN_COUNT > 0)");
        }
        if (guestCount != null) {
            sql.WHERE("EXISTS (SELECT 1 FROM NAVI_ROOM r WHERE r.ACC_NO = a.ACC_NO AND r.MAX_CNT >= #{guestCount})");
        }
        if (roomCount != null) {
            sql.WHERE("EXISTS (SELECT 1 FROM NAVI_ROOM r WHERE r.ACC_NO = a.ACC_NO AND r.ROOM_CNT >= #{roomCount})");
        }

        /* 정렬 조건 */
        switch (sort == null ? "" : sort.toLowerCase()) {
            case "minprice" -> sql.ORDER_BY("MIN_PRICE ASC");          // 낮은가격순
            case "maxprice" -> sql.ORDER_BY("MAX_PRICE DESC");         // 높은가격순
            case "view" -> sql.ORDER_BY("a.VIEW_COUNT DESC");          // 조회순
            case "recent" -> sql.ORDER_BY("a.CREATED_TIME DESC");      // 최신순
            default -> sql.ORDER_BY("a.TITLE ASC");                    // 제목순
        }

        return sql.toString();
    }
}
