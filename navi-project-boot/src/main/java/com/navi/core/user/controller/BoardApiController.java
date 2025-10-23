package com.navi.core.user.controller;

import com.navi.core.domain.Board;
import com.navi.core.domain.Comment;
import com.navi.core.user.service.BoardService;
import com.navi.core.user.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BoardApiController {

    private final BoardService boardService;
    private final CommentService commentService;

    /**
     * 현재 로그인한 사용자 번호 가져오기
     */
    private Integer getCurrentUserNo() {
        // ✅ 개발 중에는 임시로 1 반환
        return 1;

    /* 나중에 실제 로그인 구현 후 사용
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
        throw new RuntimeException("로그인이 필요합니다.");
    }

    User user = (User) auth.getPrincipal();
    return user.getUserNo();
    */
    }

    /**
     * 전체 게시글 조회
     */
    @GetMapping
    public ResponseEntity<List<Board>> getAllBoards() {
        List<Board> boards = boardService.getAllBoards();
        return ResponseEntity.ok(boards);
    }

    /**
     * 게시글 검색
     */
    @GetMapping("/search")
    public ResponseEntity<List<Board>> searchBoards(@RequestParam String keyword) {
        List<Board> boards = boardService.searchBoards(keyword);
        return ResponseEntity.ok(boards);
    }

    /**
     * 게시글 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoard(@PathVariable Integer id) {
        Board board = boardService.getBoard(id);
        return ResponseEntity.ok(board);
    }

    /**
     * 게시글 작성
     */
    @PostMapping
    public ResponseEntity<Board> createBoard(
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) MultipartFile image) {

        Integer userNo = getCurrentUserNo();
        Board board = boardService.createBoard(title, content, userNo, image);
        return ResponseEntity.ok(board);
    }

    /**
     * 이미지 업로드 (별도 엔드포인트)
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam MultipartFile file) {
        // 임시 저장 후 URL 반환
        // 실제 게시글 작성 시 해당 이미지와 연결
        return ResponseEntity.ok(Map.of("imageUrl", "/images/temp/" + file.getOriginalFilename()));
    }

    /**
     * 게시글 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Board> updateBoard(
            @PathVariable Integer id,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) MultipartFile image) {

        Integer userNo = getCurrentUserNo();
        Board board = boardService.updateBoard(id, title, content, userNo, image);
        return ResponseEntity.ok(board);
    }

    /**
     * 게시글 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Integer id) {
        Integer userNo = getCurrentUserNo();
        boardService.deleteBoard(id, userNo);
        return ResponseEntity.noContent().build();
    }

    /**
     * 게시글 좋아요
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likeBoard(@PathVariable Integer id) {
        boardService.likeBoard(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 게시글 좋아요 취소
     */
    @DeleteMapping("/{id}/like")
    public ResponseEntity<Void> unlikeBoard(@PathVariable Integer id) {
        boardService.unlikeBoard(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 게시글 신고
     */
    @PostMapping("/{id}/report")
    public ResponseEntity<Void> reportBoard(@PathVariable Integer id) {
        boardService.reportBoard(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 게시글의 댓글 조회
     */
    @GetMapping("/{id}/comments")  // ✅ 이게 있나요?
    public ResponseEntity<List<Comment>> getComments(@PathVariable Integer id) {
        List<Comment> comments = commentService.getCommentsByBoardNo(id);
        return ResponseEntity.ok(comments);
    }

    /**
     * 댓글 작성
     */
    @PostMapping("/{id}/comment")
    public ResponseEntity<Comment> createComment(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {

        Integer userNo = getCurrentUserNo();
        String content = request.get("content");

        Comment comment = commentService.createComment(id, userNo, content);
        return ResponseEntity.ok(comment);
    }

    /**
     * 대댓글 작성
     */
    @PostMapping("/{id}/comment/{parentCommentNo}/reply")
    public ResponseEntity<?> createReply(
            @PathVariable Integer id,
            @PathVariable Integer parentCommentNo,
            @RequestBody Map<String, String> request) {

        Integer userNo = getCurrentUserNo();
        String content = request.get("content");

        Comment reply = commentService.createReply(id, parentCommentNo, userNo, content);
        return ResponseEntity.ok(reply);
    }

    /**
     * 댓글 삭제
     */
    @DeleteMapping("/comment/{commentNo}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer commentNo) {
        Integer userNo = getCurrentUserNo();
        commentService.deleteComment(commentNo, userNo);
        return ResponseEntity.noContent().build();
    }

    /**
     * 댓글 신고
     */
    @PostMapping("/comment/{commentNo}/report")
    public ResponseEntity<Void> reportComment(@PathVariable Integer commentNo) {
        commentService.reportComment(commentNo);
        return ResponseEntity.ok().build();
    }


}