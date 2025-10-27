package com.navi.core.user.service;


import com.navi.core.domain.Notice;
import com.navi.core.dto.NoticeDTO;
import com.navi.core.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    // Entity -> DTO 변환
    private NoticeDTO convertToDTO(Notice notice) {
        return NoticeDTO.builder()
                .noticeNo(notice.getNoticeNo())
                .noticeTitle(notice.getNoticeTitle())
                .noticeContent(notice.getNoticeContent())
                .noticeImage(notice.getNoticeImage())
                .noticeFile(notice.getNoticeFile())
                .createDate(notice.getCreateDate())
                .updateDate(notice.getUpdateDate())
                .noticeViewCount(notice.getNoticeViewCount())
                .noticeStartDate(notice.getNoticeStartDate())
                .noticeEndDate(notice.getNoticeEndDate())
                .build();
    }

    // 공지사항 전체 목록 조회 (페이징)
    @Transactional(readOnly = true)
    public Page<NoticeDTO> getAllNotices(Pageable pageable) {
        return noticeRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    // 공지사항 조회수 증가
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

    //공지사항 검색
    @Transactional(readOnly = true)
    public Page<NoticeDTO> searchNotices(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllNotices(pageable);
        }

        return noticeRepository.findByNoticeTitleContainingOrNoticeContentContaining(
                keyword, keyword, pageable
        ).map(this::convertToDTO);
    }
}