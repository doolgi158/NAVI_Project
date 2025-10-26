package com.navi.room.mapper;

import com.navi.room.dto.response.RoomRsvResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.SelectProvider;

import java.util.List;

@Mapper
public interface RoomRsvMapper {
    /* 관리자용 예약 목록 조회 */
    @SelectProvider(type = RoomRsvSqlProvider.class, method = "buildAdminListQuery")
    List<RoomRsvResponseDTO> selectAdminRoomRsvList(
            @Param("offset") int offset,
            @Param("size") int size,
            @Param("status") String status,
            @Param("keyword") String keyword,
            @Param("sortField") String sortField,
            @Param("sortOrder") String sortOrder
    );

    /* 전체 개수 조회 (페이징용) */
    @SelectProvider(type = RoomRsvSqlProvider.class, method = "buildAdminListCountQuery")
    int countAdminRoomRsvList(
            @Param("status") String status,
            @Param("keyword") String keyword
    );
}

