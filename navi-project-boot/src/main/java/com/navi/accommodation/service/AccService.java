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
    /** === 관리자 전용 API 적재 === */
    // 최초 적재(acc_list.json)
    public void loadApiFromJsonFile() throws IOException;
    // 신규 데이터 삽입(acc_list.json)
    public void insertInitialFromApi(AccApiDTO dto);
    // 최초 적재(acc_basic.json & acc_extra.json)
    public void updateApiFromJsonFile() throws IOException;
    // 기존 데이터 갱신(acc_basic.json & acc_extra.json)
    public void updateInitialFromApi(Acc acc, AccApiDTO dto);

    /** === 숙소 데이터 추가 적재 === */
    void loadFromAdminJsonFile() throws IOException;

    /** === 관리자 전용 CRUD === */
    Acc createAcc(AccRequestDTO dto);
    Acc updateAcc(Long accNo, AccRequestDTO dto);
    void deleteAcc(Long accNo);
    // 숙소 전체 리스트 조회
    List<Acc> getAllAcc();

    /** === 사용자 전용 조회 === */
    // 숙소 리스트 조회 (검색 조건 필터링)
    List<AccListResponseDTO> searchAccommodations(AccSearchRequestDTO dto);
    // 숙소 상세 조회(객실 목록 + 이미지 포함)
    AccDetailResponseDTO getAccDetail(String accId);
}