package com.navi.core.admin.controller;



import com.navi.core.admin.dto.AdminNoticeDTO;
import com.navi.core.admin.service.AdminNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/notice")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
// TODO: @PreAuthorize("hasRole('ADMIN')") 추가 예정
public class AdminNoticeController {

    private final AdminNoticeService adminNoticeService;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    // 공지사항 전체 목록 조회 (관리자)
    @GetMapping
    public ResponseEntity<List<AdminNoticeDTO>> getAllNotices() {
        List<AdminNoticeDTO> notices = adminNoticeService.getAllNotices();
        return ResponseEntity.ok(notices);
    }

    // 공지사항 상세 조회 (관리자 - 조회수 증가 없음)
    @GetMapping("/{noticeNo}")
    public ResponseEntity<AdminNoticeDTO> getNoticeById(@PathVariable Integer noticeNo) {
        AdminNoticeDTO notice = adminNoticeService.getNoticeByIdWithoutIncrement(noticeNo);
        return ResponseEntity.ok(notice);
    }

    // 공지사항 작성 (관리자 전용)
    @PostMapping
    public ResponseEntity<AdminNoticeDTO> createNotice(@RequestBody AdminNoticeDTO noticeDTO) {
        AdminNoticeDTO createdNotice = adminNoticeService.createNotice(noticeDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotice);
    }

    // 파일 업로드 (관리자 전용)
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFilename = UUID.randomUUID().toString() + extension;

            Path filePath = Paths.get(uploadDir, savedFilename);
            Files.copy(file.getInputStream(), filePath);

            String fileUrl = "http://localhost:8080/uploads/" + savedFilename;

            Map<String, String> response = new HashMap<>();
            response.put("fileUrl", fileUrl);
            response.put("originalFilename", originalFilename);
            response.put("savedFilename", savedFilename);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "파일 업로드 실패: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // 공지사항 수정 (관리자 전용)
    @PutMapping("/{noticeNo}")
    public ResponseEntity<AdminNoticeDTO> updateNotice(
            @PathVariable Integer noticeNo,
            @RequestBody AdminNoticeDTO noticeDTO) {
        AdminNoticeDTO updatedNotice = adminNoticeService.updateNotice(noticeNo, noticeDTO);
        return ResponseEntity.ok(updatedNotice);
    }

    // 공지사항 삭제 (관리자 전용)
    @DeleteMapping("/{noticeNo}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Integer noticeNo) {
        adminNoticeService.deleteNotice(noticeNo);
        return ResponseEntity.noContent().build();
    }

    // 공지사항 검색 (관리자)
    @GetMapping("/search")
    public ResponseEntity<List<AdminNoticeDTO>> searchNotices(@RequestParam String keyword) {
        List<AdminNoticeDTO> notices = adminNoticeService.searchNotices(keyword);
        return ResponseEntity.ok(notices);
    }

    // 공지사항 통계 (관리자 전용)
    @GetMapping("/statistics")
    public ResponseEntity<NoticeStatistics> getStatistics() {
        NoticeStatistics stats = adminNoticeService.getStatistics();
        return ResponseEntity.ok(stats);
    }
}

