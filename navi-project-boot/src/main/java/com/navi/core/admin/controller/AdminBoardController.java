package com.navi.core.admin.controller;

import com.navi.core.domain.Board;
import com.navi.core.admin.service.AdminBoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/board")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
// TODO: @PreAuthorize("hasRole('ADMIN')") 추가 예정
public class AdminBoardController {

    private final AdminBoardService adminBoardService;

    // 전체 게시글 목록 조회 (관리자)
    @GetMapping
    public ResponseEntity<List<Board>> getAllBoards() {
        return ResponseEntity.ok(adminBoardService.getAllBoards());
    }

    // 게시글 상세 조회 (관리자)
    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoard(@PathVariable Integer id) {
        return ResponseEntity.ok(adminBoardService.getBoard(id));
    }

    // 게시글 삭제 (관리자 - 모든 게시글 삭제 가능)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBoard(@PathVariable Integer id) {
        adminBoardService.deleteBoard(id);
        return ResponseEntity.ok("success");
    }

    // 게시글 숨기기/노출 (관리자 전용 - 추후 구현)
    @PutMapping("/{id}/visibility")
    public ResponseEntity<String> toggleVisibility(@PathVariable Integer id) {
        // TODO: 숨기기/노출 기능 구현
        return ResponseEntity.ok("success");
    }

    // 신고된 게시글 목록 조회 (관리자 전용)
    @GetMapping("/reported")
    public ResponseEntity<List<Board>> getReportedBoards() {
        return ResponseEntity.ok(adminBoardService.getReportedBoards());
    }

    // 게시글 통계 조회 (관리자 전용)
    @GetMapping("/statistics")
    public ResponseEntity<BoardStatistics> getStatistics() {
        BoardStatistics stats = adminBoardService.getStatistics();
        return ResponseEntity.ok(stats);
    }
}

