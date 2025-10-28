package com.navi.core.admin.service;

import com.navi.core.domain.Notice;
import com.navi.core.dto.NoticeDTO;
import com.navi.core.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminNoticeService {

    private final NoticeRepository noticeRepository;

    /**
     * 전체 공지사항 조회 (페이징)
     */
    @Transactional(readOnly = true)
    public Page<Notice> getAllNotices(Pageable pageable) {
        return noticeRepository.findAll(pageable);
    }

    /**
     * 공지사항 검색 (페이징)
     */
    @Transactional(readOnly = true)
    public Page<Notice> searchNotices(String keyword, Pageable pageable) {
        return noticeRepository.findByNoticeTitleContainingIgnoreCaseOrNoticeContentContainingIgnoreCase(
                keyword, keyword, pageable);
    }

    /**
     * 전체 공지사항 조회 (리스트 반환 - 유지용)
     */
    @Transactional(readOnly = true)
    public List<NoticeDTO> getAllNotices() {
        return noticeRepository.findAll().stream()
                .map(NoticeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Notice save(Notice notice) {
        return noticeRepository.save(notice);
    }

    @Transactional(readOnly = true)
    public Notice findById(Long id) {
        return noticeRepository.findById(id.intValue())
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
    }

    public void delete(Long id) {
        noticeRepository.deleteById(id.intValue());
        log.info("공지사항 삭제 완료. ID: {}", id);
    }
}