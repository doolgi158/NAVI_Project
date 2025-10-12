package com.navi.delivery.service;

import com.navi.delivery.domain.Bag;
import java.util.List;
import java.util.Optional;

/**
 * 가방 요금 관리 서비스 인터페이스
 * - 요금 조회, 등록, 삭제 기능 정의
 */
public interface BagService {

    List<Bag> getAllBags();         // 전체 가방 요금 조회

    Optional<Bag> getBagBySize(String size);   // 가방 크기로 단일 조회

    Bag saveBag(Bag bag);           // 가방 요금 등록 또는 수정

    void deleteBag(String size);    // 가방 요금 삭제
}
