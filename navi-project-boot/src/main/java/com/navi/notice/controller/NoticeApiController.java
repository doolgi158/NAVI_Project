package com.navi.notice.controller;

import com.navi.notice.dto.NoticeDTO;
import com.navi.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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