package com.navi.notice.controller;

import com.navi.notice.dto.NoticeDTO;
import com.navi.notice.service.NoticeService;
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
@RequestMapping("/api/notice")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // 리액트 개발 서버 주소
public class NoticeApiController {

    //HTTP 요청을 받아서 Service 호출, 결과를 JSON으로 리액트에 전달, REST API 엔드포인트 제공

    private final NoticeService noticeService;

    // 공지사항 전체 목록 조회
    @GetMapping
    public ResponseEntity<List<NoticeDTO>> getAllNotices() {
        List<NoticeDTO> notices = noticeService.getAllNotices();
        return ResponseEntity.ok(notices);
    }

    // 공지사항 상세 조회
    @GetMapping("/{noticeNo}")
    public ResponseEntity<NoticeDTO> getNoticeById(@PathVariable Integer noticeNo) {
        NoticeDTO notice = noticeService.getNoticeById(noticeNo);
        return ResponseEntity.ok(notice);
    }

    // 공지사항 작성
    @PostMapping
    public ResponseEntity<NoticeDTO> createNotice(@RequestBody NoticeDTO noticeDTO) {
        NoticeDTO createdNotice = noticeService.createNotice(noticeDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotice);
    }

    // 파일 저장 경로
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    // ============ 파일 업로드 기능 추가 ============
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // 업로드 디렉토리 생성
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 파일명 중복 방지를 위해 UUID 추가
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String savedFilename = UUID.randomUUID().toString() + extension;

            // 파일 저장
            Path filePath = Paths.get(uploadDir, savedFilename);
            Files.copy(file.getInputStream(), filePath);

            // 파일 URL 생성
            String fileUrl = "http://localhost:5173/uploads/" + savedFilename;

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

    // 공지사항 수정
    @PutMapping("/{noticeNo}")
    public ResponseEntity<NoticeDTO> updateNotice(
            @PathVariable Integer noticeNo,
            @RequestBody NoticeDTO noticeDTO) {
        NoticeDTO updatedNotice = noticeService.updateNotice(noticeNo, noticeDTO);
        return ResponseEntity.ok(updatedNotice);
    }

    // 공지사항 삭제
    @DeleteMapping("/{noticeNo}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Integer noticeNo) {
        noticeService.deleteNotice(noticeNo);
        return ResponseEntity.noContent().build();
    }

    // 공지사항 검색
    @GetMapping("/search")
    public ResponseEntity<List<NoticeDTO>> searchNotices(@RequestParam String keyword) {
        List<NoticeDTO> notices = noticeService.searchNotices(keyword);
        return ResponseEntity.ok(notices);
    }
}