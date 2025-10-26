package com.navi.core.admin.controller;

import com.navi.core.admin.service.AdminNoticeService;
import com.navi.core.dto.NoticeDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/adm/notice")
@RequiredArgsConstructor
public class AdminNoticeController {

    private final AdminNoticeService adminNoticeService;

    // 파일 저장 경로 설정
    private final String UPLOAD_DIR = "uploads/notice/";

    /**
     * 전체 공지사항 조회
     */
    @GetMapping
    public ResponseEntity<List<NoticeDTO>> getAllNotices() {
        List<NoticeDTO> notices = adminNoticeService.getAllNotices();
        return ResponseEntity.ok(notices);
    }

    /**
     * 공지사항 상세 조회
     */
    @GetMapping("/{noticeNo}")
    public ResponseEntity<NoticeDTO> getNotice(@PathVariable Integer noticeNo) {
        NoticeDTO notice = adminNoticeService.getNotice(noticeNo);
        return ResponseEntity.ok(notice);
    }

    /**
     * 공지사항 검색
     */
    @GetMapping("/search")
    public ResponseEntity<List<NoticeDTO>> searchNotices(@RequestParam String keyword) {
        List<NoticeDTO> notices = adminNoticeService.searchNotices(keyword);
        return ResponseEntity.ok(notices);
    }

    /**
     * 공지사항 작성 (이미지 업로드 포함)
     */
    @PostMapping
    public ResponseEntity<NoticeDTO> createNotice(@RequestBody NoticeDTO noticeDTO) {
        try {
            NoticeDTO created = adminNoticeService.createNotice(noticeDTO);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            log.error("공지사항 작성 실패", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 공지사항 수정 (이미지 업로드 포함)
     */
    @PutMapping("/{noticeNo}")
    public ResponseEntity<NoticeDTO> updateNotice(
            @PathVariable Integer noticeNo,
            @RequestBody NoticeDTO noticeDTO
    ) {
        try {
            NoticeDTO updated = adminNoticeService.updateNotice(noticeNo, noticeDTO);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("공지사항 수정 실패", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 공지사항 삭제
     */
    @DeleteMapping("/{noticeNo}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Integer noticeNo) {
        adminNoticeService.deleteNotice(noticeNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 파일 저장 메서드
     */
    private String saveFile(MultipartFile file, String type) throws IOException {
        // 업로드 디렉토리 생성
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        // 고유한 파일명 생성 (UUID 사용)
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String savedFilename = UUID.randomUUID().toString() + extension;

        // 파일 저장
        Path filePath = Paths.get(UPLOAD_DIR + savedFilename);
        Files.write(filePath, file.getBytes());

        log.info("파일 저장 완료: {}", filePath);

        // 웹에서 접근 가능한 경로 반환
        return "/" + UPLOAD_DIR + savedFilename;
    }
}