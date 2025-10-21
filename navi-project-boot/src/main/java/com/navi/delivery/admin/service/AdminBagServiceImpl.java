package com.navi.delivery.admin.service.impl;

import com.navi.delivery.admin.dto.AdminBagDTO;
import com.navi.delivery.admin.service.AdminBagService;
import com.navi.delivery.domain.Bag;
import com.navi.delivery.repository.BagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminBagServiceImpl implements AdminBagService {

    private final BagRepository bagRepository;

    @Override
    public List<AdminBagDTO> getAllBags() {
        return bagRepository.findAll().stream()
                .map(AdminBagDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public AdminBagDTO getBagById(Long id) {
        Bag bag = bagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bag not found. ID=" + id));
        return AdminBagDTO.fromEntity(bag);
    }

    @Override
    public AdminBagDTO createBag(AdminBagDTO dto) {
        Bag saved = bagRepository.save(dto.toEntity());
        return AdminBagDTO.fromEntity(saved);
    }

    @Override
    public AdminBagDTO updateBag(Long id, AdminBagDTO dto) {
        Bag bag = bagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bag not found. ID=" + id));
        
        bag.setBagCode(dto.getBagCode());
        bag.setBagName(dto.getBagName());
        bag.setPrice(dto.getPrice());

        Bag updated = bagRepository.save(bag);
        return AdminBagDTO.fromEntity(updated);
    }

    @Override
    public void deleteBag(Long id) {
        if (!bagRepository.existsById(id)) {
            throw new IllegalArgumentException("Bag not found. ID=" + id);
        }
        bagRepository.deleteById(id);
    }
}
