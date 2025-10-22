package com.navi.core.user.controller;

import com.navi.core.user.dto.NoticeDTO;
import com.navi.core.user.service.NoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/notice")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NoticeApiController {

    private final NoticeService noticeService;

    /**
     * 공지사항 전체 목록 조회 (비로그인 가능)
     */
    @GetMapping
    public ResponseEntity<List<NoticeDTO>> getAllNotices() {
        List<NoticeDTO> notices = noticeService.getAllNotices();
        log.info("공지사항 목록 조회: {} 건", notices.size());
        return ResponseEntity.ok(notices);
    }

    /**
     * 공지사항 상세 조회 (비로그인 가능, 조회수 증가)
     */
    @GetMapping("/{noticeNo}")
    public ResponseEntity<NoticeDTO> getNoticeById(@PathVariable Integer noticeNo) {
        NoticeDTO notice = noticeService.getNoticeById(noticeNo);
        log.info("공지사항 조회: {}", noticeNo);
        return ResponseEntity.ok(notice);
    }

    /**
     * 공지사항 검색 (비로그인 가능)
     */
    @GetMapping("/search")
    public ResponseEntity<List<NoticeDTO>> searchNotices(@RequestParam String keyword) {
        List<NoticeDTO> notices = noticeService.searchNotices(keyword);
        log.info("공지사항 검색: {} - {} 건", keyword, notices.size());
        return ResponseEntity.ok(notices);
    }
}