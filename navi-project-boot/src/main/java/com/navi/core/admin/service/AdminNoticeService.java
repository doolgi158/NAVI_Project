package com.navi.core.admin.service;

import com.navi.core.domain.Notice;
import com.navi.core.dto.NoticeDTO;
import com.navi.core.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
     * 전체 공지사항 조회
     */
    @Transactional(readOnly = true)
    public List<NoticeDTO> getAllNotices() {
        return noticeRepository.findAll().stream()
                .map(NoticeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // 공지사항 전체 목록 조회 (관리자)
    @Transactional(readOnly = true)
    public List<NoticeDTO> searchNotices(String keyword) {
        // TODO: 실제 검색 로직 구현
        return noticeRepository.findAll().stream()
                .filter(notice ->
                        notice.getNoticeTitle().contains(keyword) ||
                                notice.getNoticeContent().contains(keyword)
                )
                .map(NoticeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // 공지사항 조회 (관리자 - 조회수 증가 없음)
    @Transactional(readOnly = true)
    public NoticeDTO getNotice(Integer noticeNo) {
        Notice notice = noticeRepository.findById(noticeNo)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다. ID: " + noticeNo));
        return NoticeDTO.fromEntity(notice);
    }

    /**
     * 공지사항 작성
     */
    public NoticeDTO createNotice(NoticeDTO noticeDTO) {
        Notice notice = noticeDTO.toEntity();

        // 조회수 초기화
        if (notice.getNoticeViewCount() == null) {
            notice.setNoticeViewCount(0);
        }

        Notice savedNotice = noticeRepository.save(notice);
        log.info("공지사항 작성 완료. ID: {}", savedNotice.getNoticeNo());
        return NoticeDTO.fromEntity(savedNotice);
    }

    // 공지사항 수정 (관리자 전용)
    public NoticeDTO updateNotice(Integer noticeNo, NoticeDTO noticeDTO) {
        Notice notice = noticeRepository.findById(noticeNo)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다. ID: " + noticeNo));

        // 업데이트
        notice.setNoticeTitle(noticeDTO.getNoticeTitle());
        notice.setNoticeContent(noticeDTO.getNoticeContent());
        notice.setNoticeFile(noticeDTO.getNoticeFile());
        notice.setNoticeFile(noticeDTO.getNoticeFile());
        notice.setNoticeStartDate(noticeDTO.getNoticeStartDate());
        notice.setNoticeEndDate(noticeDTO.getNoticeEndDate());
        notice.setNoticeImage(noticeDTO.getNoticeImage());
        notice.setNoticeFile(noticeDTO.getNoticeFile());

        Notice savedNotice = noticeRepository.save(notice);
        log.info("공지사항 수정 완료. ID: {}", noticeNo);
        return NoticeDTO.fromEntity(savedNotice);
    }

    // 공지사항 삭제 (관리자 전용)
    public void deleteNotice(Integer noticeNo) {
        Notice notice = noticeRepository.findById(noticeNo)
                .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다. ID: " + noticeNo));

        noticeRepository.deleteById(noticeNo);
        log.info("공지사항 삭제 완료. ID: {}", noticeNo);
    }
}