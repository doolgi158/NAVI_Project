package com.navi.delivery.service;

import com.navi.delivery.domain.Bag;
import java.util.List;
import java.util.Optional;

public interface BagService {

    // 모든 가방 요금 조회
    List<Bag> getAllBags();

    // 특정 가방 조회
    Optional<Bag> getBag(Long bagId);

    // 가방 요금 추가/수정
    Bag saveBag(Bag bag);

    // 가방 삭제
    void deleteBag(Long bagId);
}
