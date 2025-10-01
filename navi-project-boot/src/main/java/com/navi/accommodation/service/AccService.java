package com.navi.accommodation.service;

import com.navi.accommodation.domain.Acc;
import com.navi.accommodation.dto.api.AccApiDTO;

import java.io.IOException;
import java.util.List;

public interface AccService {
    // acc_list.json 전체 숙소 불러오기(insert)
    public void loadFromJsonFile() throws IOException;
    // 나머지 json 파일 데이터 불러오기(update)
    public void updateFromJsonFile() throws IOException;
    // DTO 거쳐서 처리하기
    public void insertDTOFromApi(AccApiDTO dto);
}
