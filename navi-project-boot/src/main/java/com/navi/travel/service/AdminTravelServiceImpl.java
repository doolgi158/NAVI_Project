package com.navi.travel.service;

import com.navi.travel.domain.Travel;
import com.navi.travel.dto.admin.AdminTravelListResponseDTO;
import com.navi.travel.repository.admin.AdminTravelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminTravelServiceImpl implements AdminTravelService {

    private final AdminTravelRepository adminTravelRepository;

    @Override
    public Page<AdminTravelListResponseDTO> getAdminTravelList(Pageable pageable, String search) {
        Page<Travel> page = adminTravelRepository.findAll(pageable);
        return page.map(AdminTravelListResponseDTO::of);
    }

    @Override
    public void deleteTravel(Long travelId) {
        adminTravelRepository.deleteById(travelId);
    }

    @Override
    public void updateState(List<Integer> ids, Integer state) {
        ids.forEach(id -> {
            Travel travel = adminTravelRepository.findById(Long.valueOf(id))
                    .orElseThrow(() -> new NoSuchElementException("Travel not found: " + id));
            travel.setState(state);

            List<Travel> travels = adminTravelRepository.findAllById(ids.stream().map(Long::valueOf).toList());
            travels.forEach(t -> t.setState(state));
            adminTravelRepository.saveAll(travels);
        });
    }
}