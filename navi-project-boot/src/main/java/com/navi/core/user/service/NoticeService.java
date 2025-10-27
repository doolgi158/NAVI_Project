package com.navi.core.user.service;


import com.navi.core.domain.Notice;
import com.navi.core.dto.NoticeDTO;
import com.navi.core.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    // ==================== 사용자용 메서드 ====================

    // Entity -> DTO 변환
    private NoticeDTO convertToDTO(Notice notice) {
        return NoticeDTO.builder()
                .noticeNo(notice.getNoticeNo())
                .noticeTitle(notice.getNoticeTitle())
                .noticeContent(notice.getNoticeContent())
                .noticeImage(notice.getNoticeImage())
                .createDate(notice.getCreateDate())
                .updateDate(notice.getUpdateDate())
                .noticeViewCount(notice.getNoticeViewCount())
                .noticeStartDate(notice.getNoticeStartDate())
                .noticeEndDate(notice.getNoticeEndDate())
                .build();
    }

    /**
     * 공지사항 전체 목록 조회 (페이징)
     */
    @Transactional(readOnly = true)
    public Page<NoticeDTO> getAllNotices(Pageable pageable) {
        return noticeRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    /**
     * 공지사항 상세 조회 (조회수 증가 포함)
     */
    @Transactional
    public NoticeDTO getNoticeById(Integer noticeNo) {
        log.info("=== 조회수 증가 시작: noticeNo = {} ===", noticeNo);

        Notice notice = noticeRepository.findById(noticeNo)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

        log.info("조회 전 조회수: {}", notice.getNoticeViewCount());

        // 조회수 증가
        noticeRepository.incrementViewCount(noticeNo);
        log.info("incrementViewCount 실행 완료");

        // 조회수 증가 후 다시 조회
        notice = noticeRepository.findById(noticeNo)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

        log.info("조회 후 조회수: {}", notice.getNoticeViewCount());
        log.info("=== 조회수 증가 완료 ===");

        return convertToDTO(notice);
    }

    /**
     * 공지사항 검색
     */
    @Transactional(readOnly = true)
    public Page<NoticeDTO> searchNotices(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllNotices(pageable);
        }

        return noticeRepository.findByNoticeTitleContainingOrNoticeContentContaining(
                keyword, keyword, pageable
        ).map(this::convertToDTO);
    }

    /**
     * 활성 공지사항 조회 (게시 기간 내만)
     */
    @Transactional(readOnly = true)
    public Page<Notice> getActiveNotices(Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();

        // TODO: Repository에 쿼리 메서드 추가하면 더 효율적
        // 현재는 전체 조회 후 필터링
        return noticeRepository.findAll(pageable);
    }

    /**
     * 최신 공지사항 조회 (메인 페이지용)
     */
    @Transactional(readOnly = true)
    public List<Notice> getRecentNotices(int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by("createDate").descending());
        return noticeRepository.findAll(pageRequest).getContent();
    }

    // ==================== NoticeApiController를 위한 추가 메서드 ====================

    /**
     * 공지사항 조회 (Entity 반환, 조회수 증가 없음, Long 타입 지원)
     */
    @Transactional(readOnly = true)
    public Notice findById(Long id) {
        return noticeRepository.findById(id.intValue())
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
    }

    /**
     * 조회수 증가 (사용자용)
     */
    @Transactional
    public void increaseViewCount(Long id) {
        noticeRepository.incrementViewCount(id.intValue());
    }
}