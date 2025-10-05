package com.navi.accommodation.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;

import java.io.IOException;
import java.util.List;

public interface AccService {
    /* === 관리자 전용 API 적재 === */
    public void loadFromJsonFile() throws IOException;
    public void insertInitialFromApi(AccApiDTO dto);
    public void updateFromJsonFile() throws IOException;

    /* === 관리자 전용 CRUD === */
    Acc createAcc(AccRequestDTO dto);
    Acc updateAcc(Long accNo, AccRequestDTO dto);
    void deleteAcc(Long accNo);

    /* === 조회 (공통) === */
    List<Acc> getAllAcc();
}
