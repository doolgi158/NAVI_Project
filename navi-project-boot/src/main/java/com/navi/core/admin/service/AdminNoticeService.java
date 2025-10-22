package com.navi.core.admin.service;


import com.navi.core.admin.controller.NoticeStatistics;
import com.navi.core.admin.dto.AdminNoticeDTO;
import com.navi.core.domain.Notice;
import com.navi.core.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminNoticeService {

    private static NoticeRepository noticeRepository;

    // Entity -> DTO 변환
    private static AdminNoticeDTO convertToDTO(Notice notice) {
        return AdminNoticeDTO.builder()
                .noticeNo(notice.getNoticeNo())
                .noticeTitle(notice.getNoticeTitle())
                .noticeContent(notice.getNoticeContent())
                .createDate(notice.getCreateDate())
                .updateDate(notice.getUpdateDate())
                .noticeViewCount(notice.getNoticeViewCount())
                .noticeStartDate(notice.getNoticeStartDate())
                .noticeEndDate(notice.getNoticeEndDate())
                .build();
    }

    // DTO -> Entity 변환
    private static Notice convertToEntity(AdminNoticeDTO dto) {
        return Notice.builder()
                .noticeNo(dto.getNoticeNo())
                .noticeTitle(dto.getNoticeTitle())
                .noticeContent(dto.getNoticeContent())
                .noticeViewCount(dto.getNoticeViewCount())
                .noticeStartDate(dto.getNoticeStartDate())
                .noticeEndDate(dto.getNoticeEndDate())
                .build();
    }

    // 공지사항 전체 목록 조회 (관리자)
    @Transactional(readOnly = true)
    public List<AdminNoticeDTO> getAllNotices() {
        return noticeRepository.findAllByOrderByCreateDateDesc()
                .stream()
                .map(AdminNoticeService::convertToDTO)
                .collect(Collectors.toList());
    }

    // 공지사항 조회 (관리자 - 조회수 증가 없음)
    @Transactional(readOnly = true)
    public AdminNoticeDTO getNoticeByIdWithoutIncrement(Integer noticeNo) {
        Notice notice = noticeRepository.findById(noticeNo)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
        return convertToDTO(notice);
    }

    // 공지사항 작성 (관리자 전용)
    public static AdminNoticeDTO createNotice(AdminNoticeDTO noticeDTO) {
        Notice notice = convertToEntity(noticeDTO);
        Notice savedNotice = noticeRepository.save(notice);
        log.info("[관리자] 공지사항 작성 완료. ID: {}", savedNotice.getNoticeNo());
        return convertToDTO(savedNotice);
    }

    // 공지사항 수정 (관리자 전용)
    public AdminNoticeDTO updateNotice(Integer noticeNo, AdminNoticeDTO noticeDTO) {
        Notice notice = noticeRepository.findById(noticeNo)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

        notice.setNoticeTitle(noticeDTO.getNoticeTitle());
        notice.setNoticeContent(noticeDTO.getNoticeContent());
        notice.setNoticeStartDate(noticeDTO.getNoticeStartDate());
        notice.setNoticeEndDate(noticeDTO.getNoticeEndDate());

        Notice updatedNotice = noticeRepository.save(notice);
        log.info("[관리자] 공지사항 수정 완료. ID: {}", noticeNo);
        return convertToDTO(updatedNotice);
    }

    // 공지사항 삭제 (관리자 전용)
    public void deleteNotice(Integer noticeNo) {
        if (!noticeRepository.existsById(noticeNo)) {
            throw new RuntimeException("공지사항을 찾을 수 없습니다.");
        }
        noticeRepository.deleteById(noticeNo);
        log.info("[관리자] 공지사항 삭제 완료. ID: {}", noticeNo);
    }

    // 공지사항 검색 (관리자)
    @Transactional(readOnly = true)
    public List<AdminNoticeDTO> searchNotices(String keyword) {
        return noticeRepository.findByNoticeTitleContainingOrderByCreateDateDesc(keyword)
                .stream()
                .map(AdminNoticeService::convertToDTO)
                .collect(Collectors.toList());
    }

    // 공지사항 통계 (관리자 전용)
    @Transactional(readOnly = true)
    public NoticeStatistics getStatistics() {
        List<Notice> allNotices = noticeRepository.findAll();

        // 전체 공지사항 수
        Long totalNotices = (long) allNotices.size();

        // 현재 게시 중인 공지 (시작일 <= 현재 <= 종료일)
        LocalDateTime now = LocalDateTime.now();
        Long activeNotices = allNotices.stream()
                .filter(notice -> {
                    boolean afterStart = notice.getNoticeStartDate() == null || notice.getNoticeStartDate().isBefore(now);
                    boolean beforeEnd = notice.getNoticeEndDate() == null || notice.getNoticeEndDate().isAfter(now);
                    return afterStart && beforeEnd;
                })
                .count();

        // 오늘 작성된 공지
        LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIN);
        Long todayNotices = allNotices.stream()
                .filter(notice -> notice.getCreateDate().isAfter(todayStart))
                .count();

        return new NoticeStatistics(totalNotices, activeNotices, todayNotices);
    }
}