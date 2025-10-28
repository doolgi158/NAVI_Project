package com.navi.core.admin.controller;

import com.navi.core.admin.service.AdminNoticeService;
import com.navi.core.domain.Notice;
import com.navi.image.dto.ImageDTO;
import com.navi.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/api/notice")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminNoticeController {

    private final AdminNoticeService adminNoticeService;
    private final ImageService imageService;

    // ==================== 공지사항 작성 (관리자만) ====================
    @PostMapping
    public ResponseEntity<?> createNotice(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "imageUrl", required = false) String imageUrl) {  // ✅ 추가 (중괄호 수정)

        try {
            Notice notice = new Notice();
            notice.setNoticeTitle(title);
            notice.setNoticeContent(content);
            notice.setNoticeViewCount(0);

            // ✅ 이미지 URL 설정 (이미 업로드된 경우)
            if (imageUrl != null && !imageUrl.isEmpty()) {
                notice.setNoticeImage(imageUrl);
                log.info("이미지 URL 설정 완료: {}", imageUrl);
            }


            if (startDate != null && !startDate.isEmpty()) {
                notice.setNoticeStartDate(LocalDateTime.parse(startDate));
            }
            if (endDate != null && !endDate.isEmpty()) {
                notice.setNoticeEndDate(LocalDateTime.parse(endDate));
            }

            Notice savedNotice = adminNoticeService.save(notice);
            log.info("공지사항 작성 완료 - noticeNo: {}", savedNotice.getNoticeNo());

            return ResponseEntity.ok(savedNotice);

        } catch (Exception e) {
            log.error("공지사항 작성 실패", e);
            return ResponseEntity.badRequest().body("공지사항 작성에 실패했습니다: " + e.getMessage());
        }
    }

    // ==================== 공지사항 수정 (관리자만) ====================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNotice(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "removeImage", required = false) String removeImage) {

        try {
            Notice notice = adminNoticeService.findById(id);
            notice.setNoticeTitle(title);
            notice.setNoticeContent(content);

            if (startDate != null && !startDate.isEmpty()) {
                notice.setNoticeStartDate(LocalDateTime.parse(startDate));
            }
            if (endDate != null && !endDate.isEmpty()) {
                notice.setNoticeEndDate(LocalDateTime.parse(endDate));
            }

            if ("true".equals(removeImage)) {
                imageService.deleteImage("NOTICE", String.valueOf(id));
                notice.setNoticeImage(null);
                log.info("이미지 삭제 완료 - noticeNo: {}", id);
            } else if (image != null && !image.isEmpty()) {
                ImageDTO imageDTO = imageService.uploadImage(
                        image,
                        "NOTICE",
                        String.valueOf(id)
                );
                notice.setNoticeImage(imageDTO.getPath());
                log.info("이미지 수정 완료 - noticeNo: {}, path: {}", id, imageDTO.getPath());
            }

            Notice updatedNotice = adminNoticeService.save(notice);
            return ResponseEntity.ok(updatedNotice);

        } catch (Exception e) {
            log.error("공지사항 수정 실패 - noticeNo: {}", id, e);
            return ResponseEntity.badRequest().body("공지사항 수정에 실패했습니다: " + e.getMessage());
        }
    }

    // ==================== 공지사항 삭제 (관리자만) ====================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable Long id) {
        try {
            imageService.deleteImage("NOTICE", String.valueOf(id));
            adminNoticeService.delete(id);
            log.info("공지사항 삭제 완료 - noticeNo: {}", id);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("공지사항 삭제 실패 - noticeNo: {}", id, e);
            return ResponseEntity.badRequest().body("공지사항 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    // ==================== 공지사항 목록 조회 (관리자용, 페이지네이션 적용) ====================
    @GetMapping
    public ResponseEntity<?> getAllNotices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createDate").descending());
            Page<Notice> noticePage = adminNoticeService.getAllNotices(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("notices", noticePage.getContent());
            response.put("currentPage", noticePage.getNumber());
            response.put("totalPages", noticePage.getTotalPages());
            response.put("totalItems", noticePage.getTotalElements());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("공지사항 목록 조회 실패", e);
            return ResponseEntity.badRequest().body("공지사항 목록 조회에 실패했습니다.");
        }
    }

    // ==================== 공지사항 검색 (관리자용, 페이지네이션 적용) ====================
    @GetMapping("/search")
    public ResponseEntity<?> searchNotices(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createDate").descending());
            Page<Notice> noticePage = adminNoticeService.searchNotices(keyword, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("notices", noticePage.getContent());
            response.put("currentPage", noticePage.getNumber());
            response.put("totalPages", noticePage.getTotalPages());
            response.put("totalItems", noticePage.getTotalElements());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("공지사항 검색 실패", e);
            return ResponseEntity.badRequest().body("공지사항 검색에 실패했습니다.");
        }
    }

    // ==================== 공지사항 상세 조회 (관리자용) ====================
    @GetMapping("/{id}")
    public ResponseEntity<?> getNotice(@PathVariable Long id) {
        try {
            Notice notice = adminNoticeService.findById(id);

            List<ImageDTO> images = imageService.getImagesByTarget("NOTICE", String.valueOf(id));
            if (!images.isEmpty()) {
                notice.setNoticeImage(images.get(0).getPath());
            }

            return ResponseEntity.ok(notice);

        } catch (Exception e) {
            log.error("공지사항 조회 실패 - noticeNo: {}", id, e);
            return ResponseEntity.badRequest().body("공지사항 조회에 실패했습니다.");
        }
    }
}
