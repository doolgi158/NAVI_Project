package com.navi.core.user.service;

import com.navi.core.domain.Notice;
import com.navi.core.dto.NoticeDTO;
import com.navi.core.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    // Entity → DTO 변환
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

    /** 공지사항 전체 조회 (페이징) */
    @Transactional(readOnly = true)
    public Page<NoticeDTO> getAllNotices(Pageable pageable) {
        return noticeRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    /** 공지사항 상세 조회 (조회수 증가 포함) */
    @Transactional
    public NoticeDTO getNoticeById(Integer noticeNo) {
        Notice notice = noticeRepository.findById(noticeNo)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

        noticeRepository.incrementViewCount(noticeNo);
        notice = noticeRepository.findById(noticeNo)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

        return convertToDTO(notice);
    }

    /** 공지사항 검색 */
    @Transactional(readOnly = true)
    public Page<NoticeDTO> searchNotices(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllNotices(pageable);
        }

        return noticeRepository
                .findByNoticeTitleContainingIgnoreCaseOrNoticeContentContainingIgnoreCase(keyword, keyword, pageable)
                .map(this::convertToDTO);
    }

    /** 활성 공지사항 조회 (게시 기간 내만) */
    @Transactional(readOnly = true)
    public Page<Notice> getActiveNotices(Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        return noticeRepository.findByNoticeStartDateBeforeAndNoticeEndDateAfter(now, now, pageable);
    }

    /** 최신 공지사항 조회 (메인 페이지용) */
    @Transactional(readOnly = true)
    public List<Notice> getRecentNotices(int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by("createDate").descending());
        return noticeRepository.findAll(pageRequest).getContent();
    }

    /** (선택) 조회수 증가만 따로 호출할 때 */
    @Transactional
    public void increaseViewCount(Integer noticeNo) {
        noticeRepository.incrementViewCount(noticeNo);
    }
}
