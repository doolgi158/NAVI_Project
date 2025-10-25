package com.navi.core.user.controller;

import com.navi.core.dto.NoticeDTO;
import com.navi.core.user.service.NoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/notice")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NoticeApiController {

    private final NoticeService noticeService;

    /**
     * 공지사항 전체 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllNotices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createDate").descending());
            Page<NoticeDTO> noticePage = noticeService.getAllNotices(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("notices", noticePage.getContent());
            response.put("currentPage", noticePage.getNumber());
            response.put("totalItems", noticePage.getTotalElements());
            response.put("totalPages", noticePage.getTotalPages());

            log.info("공지사항 목록 조회: {} 페이지, {} 건", page, noticePage.getContent().size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("공지사항 목록 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 공지사항 상세 조회 (비로그인 가능, 조회수 증가)
     */
    @GetMapping("/{noticeNo}")
    public ResponseEntity<NoticeDTO> getNoticeById(@PathVariable Integer noticeNo) {
        try {
            NoticeDTO notice = noticeService.getNoticeById(noticeNo);
            log.info("공지사항 조회: {} - 제목: {}", noticeNo, notice.getNoticeTitle());
            return ResponseEntity.ok(notice);
        } catch (RuntimeException e) {
            log.error("공지사항 조회 실패: {}", noticeNo, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("공지사항 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 공지사항 검색 (페이징)
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchNotices(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                log.warn("검색어가 비어있습니다.");
                return ResponseEntity.badRequest().build();
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by("createDate").descending());
            Page<NoticeDTO> noticePage = noticeService.searchNotices(keyword, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("notices", noticePage.getContent());
            response.put("currentPage", noticePage.getNumber());
            response.put("totalItems", noticePage.getTotalElements());
            response.put("totalPages", noticePage.getTotalPages());

            log.info("공지사항 검색: '{}' - {} 페이지, {} 건", keyword, page, noticePage.getContent().size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("공지사항 검색 실패: {}", keyword, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}