package com.navi.delivery.service;

import com.navi.delivery.domain.Bag;
import com.navi.delivery.repository.BagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * 가방 요금 관리 서비스 구현체
 * - CRUD 기능 처리
 */
@Service
@RequiredArgsConstructor
public class BagServiceImpl implements BagService {

    private final BagRepository bagRepository;

    @Override
    public List<Bag> getAllBags() {
        return bagRepository.findAll();
    }

    @Override
    public Optional<Bag> getBag(Long bagId) {
        return bagRepository.findById(bagId);
    }

    @Override
    public Bag saveBag(Bag bag) {
        return bagRepository.save(bag);
    }

    @Override
    public void deleteBag(Long bagId) {
        bagRepository.deleteById(bagId);
    }
}
