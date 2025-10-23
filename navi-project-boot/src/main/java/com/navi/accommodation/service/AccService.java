package com.navi.accommodation.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AdminAccListDTO;
import com.navi.accommodation.dto.request.AccRequestDTO;
import com.navi.accommodation.dto.request.AccSearchRequestDTO;
import com.navi.accommodation.dto.response.AccDetailResponseDTO;
import com.navi.accommodation.dto.response.AccListResponseDTO;

import java.util.List;

public interface AccService {
    /* === 관리자 전용 CRUD (View) === */
    Acc createAcc(AdminAccListDTO dto);
    Acc updateAcc(Long accNo, AccRequestDTO dto);
    void deleteAcc(Long accNo);

    List<AdminAccListDTO> getAllAccList(String keyword);
    List<Acc> getAllAcc();

    /* === 사용자 전용 조회 (View) === */
    // 숙소 리스트 조회 (검색 조건 필터링)
    List<AccListResponseDTO> searchAccommodations(AccSearchRequestDTO dto);
    // 숙소 상세 조회
    AccDetailResponseDTO getAccDetail(String accId);
    AccDetailResponseDTO getAccDetailByNo(Long accNo);
    // 대표 이미지 수정
    void updateMainImage(String accId);
    // 조회수 증가
    void increaseViewCount(String accId);


}