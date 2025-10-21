package com.navi.delivery.admin.service;

import com.navi.delivery.admin.dto.AdminDeliveryReservationDTO;
import com.navi.delivery.domain.Bag;
import com.navi.delivery.domain.DeliveryGroup;
import com.navi.delivery.domain.DeliveryReservation;
import com.navi.delivery.repository.BagRepository;
import com.navi.delivery.repository.DeliveryGroupRepository;
import com.navi.delivery.repository.DeliveryReservationRepository;
import com.navi.user.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final BagRepository bagRepository;
    private final DeliveryGroupRepository groupRepository;

    /**
     * ✅ 전체 조회
     */
    @Override
    public List<AdminDeliveryReservationDTO> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * ✅ 단건 조회
     */
    @Override
    public AdminDeliveryReservationDTO getReservation(String drsvId) {
        DeliveryReservation rsv = reservationRepository.findById(drsvId)
                .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다: " + drsvId));
        return toDTO(rsv);
    }

    // 예약 수정 (user 변경 불가)
    @Override
    public AdminDeliveryReservationDTO updateReservation(String drsvId, AdminDeliveryReservationDTO dto) {
        DeliveryReservation rsv = reservationRepository.findById(drsvId)
                .orElseThrow(() -> new EntityNotFoundException("예약을 찾을 수 없습니다: " + drsvId));

        // ✅ user는 변경 금지 (읽기 전용)
        if (dto.getBagId() != null) {
            Bag bag = bagRepository.findById(dto.getBagId())
                    .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 가방입니다."));
            rsv.setBag(bag);
        }

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

        return toDTO(reservationRepository.save(rsv));
    }

    /**
     * ✅ 예약 삭제
     */
    @Override
    public void deleteReservation(String drsvId) {
        if (!reservationRepository.existsById(drsvId)) {
            throw new EntityNotFoundException("존재하지 않는 예약입니다: " + drsvId);
        }
        reservationRepository.deleteById(drsvId);
    }

    /**
     * ✅ Entity → DTO 변환
     */
    private AdminDeliveryReservationDTO toDTO(DeliveryReservation r) {
        return AdminDeliveryReservationDTO.builder()
                .drsvId(r.getDrsvId())
                .userNo(r.getUser().getNo())
                .userName(r.getUser().getName())
                .bagId(r.getBag().getBagId())
                .bagName(r.getBag().getBagName())
                .bagPrice(r.getBag().getPrice())
                .groupId(r.getGroup() != null ? r.getGroup().getGroupId() : null)
                .startAddr(r.getStartAddr())
                .endAddr(r.getEndAddr())
                .deliveryDate(r.getDeliveryDate())
                .totalPrice(r.getTotalPrice())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
