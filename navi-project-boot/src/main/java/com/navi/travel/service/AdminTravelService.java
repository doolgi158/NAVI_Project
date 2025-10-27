package com.navi.travel.service;

import com.navi.travel.domain.Travel;
import com.navi.travel.dto.admin.AdminTravelDetailResponseDTO;
import com.navi.travel.dto.admin.AdminTravelListResponseDTO;
import com.navi.travel.dto.admin.AdminTravelRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminTravelService {
    /** ✅ 관리자용 목록 조회 */
    Page<AdminTravelListResponseDTO> getAdminTravelList(Pageable pageable, String search);

    /** ✅ 관리자용 상세 조회 */
    AdminTravelDetailResponseDTO getAdminTravelDetail(Long travelId);



    /** ✅ 상태 일괄 변경 */
    void updateState(List<Long> ids, Integer state);

    /** ✅ 등록, 수정 */
    Travel saveOrUpdateTravel(AdminTravelRequestDTO dto);

}
