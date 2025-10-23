package com.navi.delivery.admin.service;

import com.navi.delivery.admin.dto.AdminDeliveryReservationDTO;
import com.navi.delivery.domain.DeliveryGroup;
import com.navi.delivery.domain.DeliveryReservation;
import com.navi.delivery.repository.DeliveryGroupRepository;
import com.navi.delivery.repository.DeliveryReservationRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminDeliveryReservationServiceImpl implements AdminDeliveryReservationService {

    private final DeliveryReservationRepository reservationRepository;
    private final DeliveryGroupRepository groupRepository;

    @Override
    public List<AdminDeliveryReservationDTO> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AdminDeliveryReservationDTO getReservation(String drsvId) {
        DeliveryReservation rsv = reservationRepository.findById(drsvId)
                .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다: " + drsvId));
        return toDTO(rsv);
    }

    @Override
    public AdminDeliveryReservationDTO updateReservation(String drsvId, AdminDeliveryReservationDTO dto) {
        DeliveryReservation rsv = reservationRepository.findById(drsvId)
                .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다: " + drsvId));

        if (dto.getGroupId() != null) {
            DeliveryGroup group = groupRepository.findById(dto.getGroupId())
                    .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 그룹입니다."));
            rsv.setGroup(group);
        }

        if (dto.getStartAddr() != null) rsv.setStartAddr(dto.getStartAddr());
        if (dto.getEndAddr() != null) rsv.setEndAddr(dto.getEndAddr());
        if (dto.getDeliveryDate() != null) rsv.setDeliveryDate(dto.getDeliveryDate());
        if (dto.getTotalPrice() != null) rsv.setTotalPrice(dto.getTotalPrice());
        if (dto.getStatus() != null) rsv.setStatus(dto.getStatus());
        if (dto.getBagsJson() != null) rsv.setBagsJson(dto.getBagsJson());

        return toDTO(reservationRepository.save(rsv));
    }

    @Override
    public void deleteReservation(String drsvId) {
        if (!reservationRepository.existsById(drsvId)) {
            throw new EntityNotFoundException("존재하지 않는 예약입니다: " + drsvId);
        }
        reservationRepository.deleteById(drsvId);
    }

    private AdminDeliveryReservationDTO toDTO(DeliveryReservation r) {
        return AdminDeliveryReservationDTO.builder()
                .drsvId(r.getDrsvId())
                .userNo(r.getUser().getNo())
                .userName(r.getUser().getName())
                .groupId(r.getGroup() != null ? r.getGroup().getGroupId() : null)
                .startAddr(r.getStartAddr())
                .endAddr(r.getEndAddr())
                .deliveryDate(r.getDeliveryDate())
                .totalPrice(r.getTotalPrice())
                .status(r.getStatus())
                .bagsJson(r.getBagsJson())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
