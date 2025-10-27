package com.navi.delivery.admin.service;

import com.navi.common.enums.RsvStatus;
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
        // 1. 엔티티를 조회합니다. (상태 확인을 위해 existsById 대신 findById 사용)
        DeliveryReservation rsv = reservationRepository.findById(drsvId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 예약입니다: " + drsvId));

        // 2. ✅ RsvStatus가 PAID(결제 완료) 상태인지 확인하여 삭제를 막습니다.
        if (rsv.getStatus() == RsvStatus.PAID || rsv.getStatus() == RsvStatus.COMPLETE) {
            // IllegalStateException을 발생시켜 트랜잭션을 롤백하고 클라이언트에게 오류를 전달합니다.
            throw new IllegalStateException("결제 완료 상태(PAID)의 예약(" + drsvId + ")은 관리자 페이지에서 삭제할 수 없습니다. 취소/환불 프로세스를 이용해주세요.");
        }

        // 3. 결제 완료 상태가 아니라면 삭제를 진행합니다.
        reservationRepository.delete(rsv);
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
