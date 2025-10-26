package com.navi.core.admin.controller;

import com.navi.core.admin.service.AdminBoardService;
import com.navi.core.admin.service.AdminCommentService;
import com.navi.core.domain.Board;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/adm/board")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBoardController {

    private final AdminBoardService adminBoardService;
    private final AdminCommentService adminCommentService;

    // 전체 게시글 목록 조회 (관리자)
    @GetMapping
    public ResponseEntity<List<Board>> getAllBoards() {
        List<Board> boards = adminBoardService.getAllBoards();
        log.info("[관리자] 게시글 목록 조회: {} 건", boards.size());
        return ResponseEntity.ok(boards);
    }

    // 게시글 검색 (관리자)
    @GetMapping("/search")
    public ResponseEntity<List<Board>> searchBoards(@RequestParam String keyword) {
        List<Board> boards = adminBoardService.searchBoards(keyword);
        log.info("[관리자] 게시글 검색: {} - {} 건", keyword, boards.size());
        return ResponseEntity.ok(boards);
    }

    // 게시글 상세 조회 (관리자 - 조회수 증가 없음)
    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoard(@PathVariable Integer id) {
        Board board = adminBoardService.getBoard(id);
        log.info("[관리자] 게시글 조회: {}", id);
        return ResponseEntity.ok(board);
    }

    // 게시글 삭제 (관리자 - 모든 게시글 삭제 가능)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Integer id) {
        adminBoardService.deleteBoard(id);
        log.info("[관리자] 게시글 삭제: {}", id);
        return ResponseEntity.noContent().build();
    }

    //신고된 게시글 목록 조회 (관리자 전용)
    @GetMapping("/reported")
    public ResponseEntity<List<Board>> getReportedBoards() {
        List<Board> boards = adminBoardService.getReportedBoards();
        log.info("[관리자] 신고된 게시글 조회: {} 건", boards.size());
        return ResponseEntity.ok(boards);
    }

    //게시글 통계 조회 (관리자 전용)
    @GetMapping("/statistics")
    public ResponseEntity<BoardStatistics> getStatistics() {
        BoardStatistics stats = adminBoardService.getStatistics();
        log.info("[관리자] 게시글 통계 조회");
        return ResponseEntity.ok(stats);
    }

    // 관리자 - 댓글 삭제 (모든 댓글 삭제 가능)
    @DeleteMapping("/comment/{commentNo}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer commentNo) {
        adminCommentService.deleteCommentByAdmin(commentNo);  // 이렇게 인스턴스로 호출
        log.info("관리자 - 댓글 삭제 요청. ID: {}", commentNo);
        return ResponseEntity.noContent().build();
    }
}