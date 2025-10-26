package com.navi.user.mapper;

import com.navi.user.domain.History;
import com.navi.user.dto.log.HistoryDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HistoryMapper {
    HistoryDTO toDto(History entity);

    @Mapping(target = "user", ignore = true)
    History toEntity(HistoryDTO dto);
}
