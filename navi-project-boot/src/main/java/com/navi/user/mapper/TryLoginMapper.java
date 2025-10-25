package com.navi.user.mapper;

import com.navi.user.domain.TryLogin;
import com.navi.user.dto.log.TryLoginDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TryLoginMapper {
    TryLoginDTO toDto(TryLogin entity);

    TryLogin toEntity(TryLoginDTO dto);
}