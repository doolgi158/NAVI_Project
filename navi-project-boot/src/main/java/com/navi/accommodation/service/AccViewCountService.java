package com.navi.accommodation.service;

import com.navi.accommodation.repository.AccRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccViewCountService {
    private final AccRepository accRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void increaseViewCount(String accId) {
        accRepository.findByAccId(accId).ifPresent(acc -> {
            acc.increaseViewCount();
            accRepository.save(acc);
        });
    }
}
