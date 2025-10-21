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
    // Todo: 메서드 반환값 확인해보고 수정필수
    Acc createAcc(AdminAccListDTO dto);

    Acc updateAcc(Long accNo, AccRequestDTO dto);

    void deleteAcc(Long accNo);

    // input으로 숙소 검색
    List<AccListResponseDTO> searchByName(String name);

    // 모든 객실 리스트 조회
    List<AdminAccListDTO> getAllAccList(String keyword);

    List<Acc> getAllAcc();

    /* === 사용자 전용 조회 (View) === */
    // 숙소 리스트 조회 (검색 조건 필터링)
    List<AccListResponseDTO> searchAccommodations(AccSearchRequestDTO dto);

    // 숙소 상세 조회
    AccDetailResponseDTO getAccDetail(String accId);

    // 객실 번호로 객실 상세 페이지 조회
    AccDetailResponseDTO getAccDetailByNo(Long accNo);

    // 조회수 증가
    Acc increaseViewCount(String accId);


}