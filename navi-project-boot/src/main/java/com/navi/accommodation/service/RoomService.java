package com.navi.accommodation.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;

import java.io.IOException;

public interface RoomService {
    /* === 관리자 전용 API 적재 === */
    public void loadFromJsonFile() throws IOException;
    //public void insertInitialFromApi(AccApiDTO dto);

    /* === 관리자 전용 CRUD === */

}
