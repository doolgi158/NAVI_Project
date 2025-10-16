package com.navi.board.controller;

import com.navi.board.domain.Board;
import com.navi.board.domain.Comment;
import com.navi.board.service.BoardService;
import com.navi.board.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController  
@RequestMapping("/api/board")  // api 경로
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")  // CORS 설정
public class BoardApiController {

    private final BoardService boardService;
    private final CommentService commentService;

    // 게시글 목록 조회
    @GetMapping
    public ResponseEntity<List<Board>> getAllBoards() {
        return ResponseEntity.ok(boardService.getAllBoards());
    }

    // 게시글 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoard(@PathVariable Integer id) {
        return ResponseEntity.ok(boardService.getBoard(id));
    }

    // 게시글 작성
    @PostMapping
    public ResponseEntity<String> createBoard(@RequestBody BoardRequest request) {
        boardService.createBoard(request.getTitle(), request.getContent());
        return ResponseEntity.ok("success");
    }

    // 게시글 신고
    @PostMapping("/{id}/report")
    public ResponseEntity<String> reportBoard(@PathVariable Integer id) {
        boardService.reportBoard(id);
        return ResponseEntity.ok("success");
    }

    //좋아요
    @PostMapping("/{id}/like")
    public ResponseEntity<String> likeBoard(@PathVariable Integer id) {
        boardService.likeBoard(id);
        return ResponseEntity.ok("success");
    }
    // 좋아요 취소
    @PostMapping("/{id}/unlike")
    public ResponseEntity<String> unlikeBoard(@PathVariable Integer id) {
        boardService.unlikeBoard(id);
        return ResponseEntity.ok("success");
    }

    // 댓글 목록 조회
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Integer id) {
        return ResponseEntity.ok(commentService.getCommentsByBoardNo(id));
    }

    // 댓글 작성
    @PostMapping("/{id}/comment")
    public ResponseEntity<String> createComment(
            @PathVariable Integer id,
            @RequestBody CommentRequest request) {
        commentService.createComment(id, request.getContent());
        return ResponseEntity.ok("success");
    }

    // 댓글 삭제
    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable Integer commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok("success");
    }
}

// DTO
class BoardRequest {
    private String title;
    private String content;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}

class CommentRequest {
    private String content;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}