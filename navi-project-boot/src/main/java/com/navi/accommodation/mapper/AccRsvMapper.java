package com.navi.accommodation.mapper;

import com.navi.accommodation.domain.AccRsv;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface AccRsvMapper {
    /* == 관리자용 == */
    // 1. 전체 숙소 예약 목록 조회
    @Select("""
        SELECT *
        FROM NAVI_ACC_RSV
        ORDER BY ARSV_ID DESC, START_DATE ASC
    """)
    List<AccRsv> findAllRsv();
    // 2. 숙소별 예약 목록 조회 - 필터 기능
    @Select("""
            SELECT *
            FROM NAVI_ACC_RSV
            WHERE ROOM_ID IN (
                    SELECT ROOM_ID
                    FROM NAVI_ROOM
                    WHERE ACC_ID = #{accId}
                )
            ORDER BY START_DATE DESC
            """)
    List<AccRsv> findByAccId(@Param("accId") String accId);
    // 3. 숙소별 날짜별(하루 단위) 예약 수 조회 - 필터 기능
    @Select("""
            SELECT COUNT(*)
            FROM NAVI_ACC_RSV
            WHERE ROOM_ID IN (
                    SELECT ROOM_ID
                    FROM NAVI_ROOM
                    WHERE ACC_ID = #{accId}
                )
                AND START_DATE <= #{targetDate}
                AND END_DATE > #{targetDate}
            """)
    int countByAccIdAndDate(
            @Param("accId") String accId,
            @Param("targetDate") LocalDate targetDate
    );
    // 4. 숙소 생성
    @Insert("""
        INSERT INTO NAVI_ACC_RSV 
        (ARSV_ID, USER_NO, ROOM_ID, QUANTITY, ROOM_PRICE, START_DATE, END_DATE, RSV_STATUS)
        VALUES (#{arsvId}, #{user.userNo}, #{room.roomId}, #{quantity}, #{roomPrice}, #{startDate}, #{endDate}, #{rsvStatus})
    """)
    void insertAccRsv(AccRsv accRsv);

    /* == 사용자용 == */
    // 1. 사용자 ID별 숙소 예약 목록 조회
    @Select("""
        SELECT *
        FROM NAVI_ACC_RSV
        WHERE USER_ID = #{userId}
        ORDER BY START_DATE DESC
    """)
    List<AccRsv> findAllByUserId(@Param("userId") String userId);

    // 2. 예약 ID별 숙소 예약 상세 목록 조회
    @Select("""
        SELECT *
        FROM NAVI_ACC_RSV
        WHERE ARSV_ID = #{arsvId}
        ORDER BY START_DATE
    """)
    List<AccRsv> findAllByArsvId(@Param("arsvId") String arsvId);

    /* == [비즈니스 로직용] == */
    // 1. 체크인 날짜 조회(환불 수수료 계산용)
    @Select("""
        SELECT MIN(START_DATE)
        FROM NAVI_ACC_RSV
        WHERE ARSV_ID = #{arsvId}
    """)
    LocalDate findCheckInDateByArsvId(@Param("arsvId") String arsvId);
}
