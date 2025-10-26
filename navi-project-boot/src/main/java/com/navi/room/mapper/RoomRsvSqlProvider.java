package com.navi.room.mapper;

import org.apache.ibatis.jdbc.SQL;

public class RoomRsvSqlProvider {

    /* ✅ 관리자용 객실 예약 목록 조회 (페이징 + 필터 + 정렬) */
    public String buildAdminListQuery(final java.util.Map<String, Object> params) {
        String status = (String) params.get("status");
        String keyword = (String) params.get("keyword");
        String sortField = (String) params.get("sortField");
        String sortOrder = (String) params.get("sortOrder");
        int offset = (int) params.get("offset");
        int size = (int) params.get("size");

        SQL sql = new SQL()
                .SELECT("""
                    r.RESERVE_ID      AS reserveId,
                    r.RESERVER_NAME   AS reserverName,
                    r.RESERVER_TEL    AS reserverTel,
                    r.RESERVER_EMAIL  AS reserverEmail,
                    rm.ROOM_NAME      AS roomName,
                    a.TITLE           AS accTitle,
                    r.START_DATE      AS startDate,
                    r.END_DATE        AS endDate,
                    r.NIGHTS          AS nights,
                    r.GUEST_COUNT     AS guestCount,
                    r.QUANTITY        AS quantity,
                    r.PRICE           AS price,
                    r.RSV_STATUS      AS rsvStatus
                """)
                .FROM("NAVI_ROOM_RSV r")
                .JOIN("NAVI_ROOM rm ON r.ROOM_NO = rm.ROOM_NO")
                .JOIN("NAVI_ACCOMMODATION a ON rm.ACC_NO = a.ACC_NO")
                .WHERE("1=1");

        // ✅ 키워드 검색 (예약자명 / 숙소명 / 예약ID / 전화번호 등)
        if (keyword != null && !keyword.isBlank()) {
            sql.WHERE("""
                (LOWER(r.RESERVER_NAME) LIKE LOWER(CONCAT('%', #{keyword}, '%'))
                 OR LOWER(r.RESERVER_TEL) LIKE LOWER(CONCAT('%', #{keyword}, '%'))
                 OR LOWER(r.RESERVER_EMAIL) LIKE LOWER(CONCAT('%', #{keyword}, '%'))
                 OR LOWER(r.RESERVE_ID) LIKE LOWER(CONCAT('%', #{keyword}, '%'))
                 OR LOWER(a.TITLE) LIKE LOWER(CONCAT('%', #{keyword}, '%')))
            """);
        }

        // ✅ 상태 필터
        if (status != null && !"ALL".equalsIgnoreCase(status)) {
            sql.WHERE("r.RSV_STATUS = #{status}");
        }

        // ✅ 정렬 기준
        String orderColumn = "r.CREATED_AT";
        if ("RSV_STATUS".equalsIgnoreCase(sortField)) {
            orderColumn = "r.RSV_STATUS";
        } else if ("RESERVER_NAME".equalsIgnoreCase(sortField)) {
            orderColumn = "r.RESERVER_NAME";
        } else if ("START_DATE".equalsIgnoreCase(sortField)) {
            orderColumn = "r.START_DATE";
        }

        sql.ORDER_BY(orderColumn + " " + (sortOrder != null ? sortOrder : "DESC"));

        // ✅ 페이징 (Oracle 12c 이상)
        return sql.toString() +
                " OFFSET " + offset + " ROWS FETCH NEXT " + size + " ROWS ONLY";
    }

    /* ✅ 전체 개수 조회 */
    public String buildAdminListCountQuery(final java.util.Map<String, Object> params) {
        String status = (String) params.get("status");
        String keyword = (String) params.get("keyword");

        SQL sql = new SQL()
                .SELECT("COUNT(*)")
                .FROM("NAVI_ROOM_RSV r")
                .JOIN("NAVI_ROOM rm ON r.ROOM_NO = rm.ROOM_NO")
                .JOIN("NAVI_ACCOMMODATION a ON rm.ACC_NO = a.ACC_NO")
                .WHERE("1=1");

        // ✅ 검색 조건
        if (keyword != null && !keyword.isBlank()) {
            sql.WHERE("""
                (LOWER(r.RESERVER_NAME) LIKE LOWER(CONCAT('%', #{keyword}, '%'))
                 OR LOWER(r.RESERVER_TEL) LIKE LOWER(CONCAT('%', #{keyword}, '%'))
                 OR LOWER(r.RESERVER_EMAIL) LIKE LOWER(CONCAT('%', #{keyword}, '%'))
                 OR LOWER(r.RESERVE_ID) LIKE LOWER(CONCAT('%', #{keyword}, '%'))
                 OR LOWER(a.TITLE) LIKE LOWER(CONCAT('%', #{keyword}, '%')))
            """);
        }

        // ✅ 상태 필터
        if (status != null && !"ALL".equalsIgnoreCase(status)) {
            sql.WHERE("r.RSV_STATUS = #{status}");
        }

        return sql.toString();
    }
}
