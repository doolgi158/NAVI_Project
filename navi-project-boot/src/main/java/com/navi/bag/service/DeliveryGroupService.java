package com.navi.bag.service;

import com.navi.bag.domain.DeliveryGroup;
import java.util.List;
import java.util.Optional;

/**
 * 배차 그룹 관리 서비스 인터페이스
 * - 그룹 조회, 등록, 삭제 기능 정의
 */
public interface DeliveryGroupService {

    List<DeliveryGroup> getAllGroups();  // 전체 그룹 조회

    Optional<DeliveryGroup> getGroup(Long id);  // 그룹 단일 조회

    DeliveryGroup saveGroup(DeliveryGroup group);  // 그룹 등록 또는 수정

    void deleteGroup(Long id);  // 그룹 삭제
}
