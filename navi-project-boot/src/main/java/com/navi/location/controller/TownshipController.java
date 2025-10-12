package com.navi.location.controller;

import com.navi.location.dto.TownshipResponseDTO;
import com.navi.location.repository.TownshipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/townships")
@RequiredArgsConstructor
public class TownshipController {

    private final TownshipRepository townshipRepository;

    @GetMapping
    public List<TownshipResponseDTO> getTownships() {
        return townshipRepository.findAll()
                .stream()
                .map(TownshipResponseDTO::fromEntity)
                .toList();
    }
}

