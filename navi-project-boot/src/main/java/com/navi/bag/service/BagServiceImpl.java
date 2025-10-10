package com.navi.bag.service;

import com.navi.bag.domain.Bag;
import com.navi.bag.repository.BagRepository;
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
    public Optional<Bag> getBagBySize(String size) {
        return bagRepository.findById(size);
    }

    @Override
    public Bag saveBag(Bag bag) {
        return bagRepository.save(bag);
    }

    @Override
    public void deleteBag(String size) {
        bagRepository.deleteById(size);
    }
}
