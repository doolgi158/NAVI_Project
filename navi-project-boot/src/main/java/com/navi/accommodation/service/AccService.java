package com.navi.accommodation.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.dto.request.AccSearchRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.dto.response.AccListResponseDTO;

import java.io.IOException;
import java.util.List;

public interface AccService {
    /* === 관리자 전용 CRUD (View) === */
    Acc createAcc(AccRequestDTO dto);
    Acc updateAcc(Long accNo, AccRequestDTO dto);
    void deleteAcc(Long accNo);
    // 숙소 전체 리스트 조회
    // Todo: 페이징 처리해서 보여줘야 함
    List<Acc> getAllAcc();

    /* === 사용자 전용 조회 (View) === */
    // 숙소 리스트 조회 (검색 조건 필터링)
    List<AccListResponseDTO> searchAccommodations(AccSearchRequestDTO dto);
    // 숙소 상세 조회
    AccDetailResponseDTO getAccDetail(String accId);
}