package com.navi.core.user.controller;

import com.navi.core.domain.Notice;
import com.navi.core.user.service.NoticeService;
import com.navi.image.dto.ImageDTO;
import com.navi.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notice")
@CrossOrigin(origins = "http://localhost:5173")
public class NoticeApiController {

    private final NoticeService noticeService;
    private final ImageService imageService;

    // ==================== 공지사항 목록 조회 (게시 기간 내 공지만) ====================
    @GetMapping
    public ResponseEntity<?> getActiveNotices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createDate").descending());
            Page<Notice> noticePage = noticeService.getAllNotices(pageable);

            List<Map<String, Object>> notices = noticePage.getContent().stream()
                    .map(notice -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("noticeNo", notice.getNoticeNo());
                        map.put("noticeTitle", notice.getNoticeTitle());
                        map.put("noticeViewCount", notice.getNoticeViewCount() != null ? notice.getNoticeViewCount() : 0);
                        map.put("createDate", notice.getCreateDate());
                        map.put("noticeStartDate", notice.getNoticeStartDate());
                        map.put("noticeEndDate", notice.getNoticeEndDate());
                        map.put("noticeImage", notice.getNoticeImage());
                        return map;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("notices", notices);
            response.put("currentPage", noticePage.getNumber());
            response.put("totalPages", noticePage.getTotalPages());
            response.put("totalItems", noticePage.getTotalElements());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("공지사항 목록 조회 실패", e);
            return ResponseEntity.badRequest().body("공지사항 목록 조회에 실패했습니다.");
        }
    }

    // ==================== 공지사항 상세 조회 (조회수 증가) ====================
    @GetMapping("/{id}")
    public ResponseEntity<?> getNotice(@PathVariable Long id) {
        try {
            Notice notice = noticeService.findById(id);

            // 게시 기간 체크
            LocalDateTime now = LocalDateTime.now();
            if (notice.getNoticeStartDate() != null && now.isBefore(notice.getNoticeStartDate())) {
                return ResponseEntity.badRequest().body("아직 공개되지 않은 공지사항입니다.");
            }
            if (notice.getNoticeEndDate() != null && now.isAfter(notice.getNoticeEndDate())) {
                return ResponseEntity.badRequest().body("공개 기간이 종료된 공지사항입니다.");
            }

            // 이미지 정보 조회
            List<ImageDTO> images = imageService.getImagesByTarget("NOTICE", String.valueOf(id));

            if (!images.isEmpty()) {
                notice.setNoticeImage(images.get(0).getPath());
            }

            // 조회수 증가
            noticeService.increaseViewCount(id);

            return ResponseEntity.ok(notice);

        } catch (Exception e) {
            log.error("공지사항 조회 실패 - noticeNo: {}", id, e);
            return ResponseEntity.badRequest().body("공지사항 조회에 실패했습니다.");
        }
    }

    // ==================== 공지사항 검색 ====================
    @GetMapping("/search")
    public ResponseEntity<?> searchNotices(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createDate").descending());
            Page<Notice> noticePage = noticeService.searchNotices(keyword, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("notices", noticePage.getContent());
            response.put("currentPage", noticePage.getNumber());
            response.put("totalPages", noticePage.getTotalPages());
            response.put("totalItems", noticePage.getTotalElements());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("공지사항 검색 실패 - keyword: {}", keyword, e);
            return ResponseEntity.badRequest().body("공지사항 검색에 실패했습니다.");
        }
    }

    // ==================== 최신 공지사항 조회 (메인 페이지용) ====================
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentNotices(@RequestParam(defaultValue = "5") int limit) {
        try {
            List<Notice> notices = noticeService.getRecentNotices(limit);
            return ResponseEntity.ok(notices);

        } catch (Exception e) {
            log.error("최신 공지사항 조회 실패", e);
            return ResponseEntity.badRequest().body("최신 공지사항 조회에 실패했습니다.");
        }
    }
}