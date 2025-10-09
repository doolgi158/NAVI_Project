package com.navi.reservation.controller;

import com.navi.reservation.service.RsvService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/api/reservation")
@RequiredArgsConstructor
public class RsvController {
    @Autowired
    private final RsvService rsvService;

    /*
    @PostMapping("/payments")
    public ResponseEntity<RsvResponseDTO> createReservation(@RequestBody RsvRequestDTO dto) {
        RsvResponseDTO response = rsvService.processPayment(dto);
        return ResponseEntity.ok(response);
    }*/
}
