package com.navi.core.admin.controller;

import com.navi.core.admin.service.AdminNoticeService;
import com.navi.core.domain.Notice;
import com.navi.image.dto.ImageDTO;
import com.navi.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

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
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            // 1. Notice Entity 생성
            Notice notice = new Notice();
            notice.setNoticeTitle(title);
            notice.setNoticeContent(content);
            notice.setNoticeViewCount(0);

            if (startDate != null && !startDate.isEmpty()) {
                notice.setNoticeStartDate(LocalDateTime.parse(startDate));
            }
            if (endDate != null && !endDate.isEmpty()) {
                notice.setNoticeEndDate(LocalDateTime.parse(endDate));
            }

            // 2. 공지사항 저장
            Notice savedNotice = adminNoticeService.save(notice);
            log.info("공지사항 작성 완료 - noticeNo: {}", savedNotice.getNoticeNo());

            // 3. 이미지가 있으면 업로드
            if (image != null && !image.isEmpty()) {
                ImageDTO imageDTO = imageService.uploadImage(
                        image,
                        "NOTICE",
                        String.valueOf(savedNotice.getNoticeNo())
                );

                savedNotice.setNoticeImage(imageDTO.getPath());
                adminNoticeService.save(savedNotice);
                log.info("이미지 업로드 완료 - path: {}", imageDTO.getPath());
            }

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

            // 이미지 삭제 요청
            if ("true".equals(removeImage)) {
                imageService.deleteImage("NOTICE", String.valueOf(id));
                notice.setNoticeImage(null);
                log.info("이미지 삭제 완료 - noticeNo: {}", id);
            }
            // 새 이미지 업로드 (기존 이미지는 자동으로 교체됨)
            else if (image != null && !image.isEmpty()) {
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
            // 1. 이미지 먼저 삭제
            imageService.deleteImage("NOTICE", String.valueOf(id));
            log.info("이미지 삭제 완료 - noticeNo: {}", id);

            // 2. 공지사항 삭제
            adminNoticeService.delete(id);
            log.info("공지사항 삭제 완료 - noticeNo: {}", id);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("공지사항 삭제 실패 - noticeNo: {}", id, e);
            return ResponseEntity.badRequest().body("공지사항 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    // ==================== 공지사항 목록 조회 (관리자용) ====================
    @GetMapping
    public ResponseEntity<?> getAllNotices() {
        try {
            // 모든 공지사항 조회 (게시 기간 상관없이)
            List<?> notices = adminNoticeService.getAllNotices();
            return ResponseEntity.ok(notices);

        } catch (Exception e) {
            log.error("공지사항 목록 조회 실패", e);
            return ResponseEntity.badRequest().body("공지사항 목록 조회에 실패했습니다.");
        }
    }

    // ==================== 공지사항 상세 조회 (관리자용) ====================
    @GetMapping("/{id}")
    public ResponseEntity<?> getNotice(@PathVariable Long id) {
        try {
            Notice notice = adminNoticeService.findById(id);

            // 이미지 정보 조회
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