package com.navi.board.controller;

import com.navi.board.domain.Board;
import com.navi.board.domain.Comment;
import com.navi.board.service.BoardService;
import com.navi.board.service.CommentService;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BoardApiController {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;
    private final BoardService boardService;
    private final CommentService commentService;

    // 게시글 목록 조회
    @GetMapping
    public ResponseEntity<List<Board>> getAllBoards() {
        return ResponseEntity.ok(boardService.getAllBoards());
    }

    // 게시글 검색
    @GetMapping("/search")
    public ResponseEntity<List<Board>> searchBoards(@RequestParam String keyword) {
        return ResponseEntity.ok(boardService.searchBoards(keyword));
    }

    // 게시글 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoard(@PathVariable Integer id) {
        return ResponseEntity.ok(boardService.getBoard(id));
    }

    // 게시글 작성
    @PostMapping
    public ResponseEntity<String> createBoard(@RequestBody BoardRequest request) {
        boardService.createBoard(request.getTitle(), request.getContent(), request.getImage());
        return ResponseEntity.ok("success");
    }

    // 이미지 업로드 디렉토리
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
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

            String fileUrl = "http://localhost:5173/uploads/" + savedFilename;

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", fileUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "업로드 실패");
            return ResponseEntity.status(500).body(error);
        }
    }

    // 게시글 수정
    @PutMapping("/{id}")
    public ResponseEntity<String> updateBoard(
            @PathVariable Integer id,
            @RequestBody BoardRequest request) {
        boardService.updateBoard(id, request.getTitle(), request.getContent(), request.getImage());
        return ResponseEntity.ok("success");
    }

    // 게시글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBoard(@PathVariable Integer id) {
        boardService.deleteBoard(id);
        return ResponseEntity.ok("success");
    }

    // 좋아요
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

    // 게시글 신고
    @PostMapping("/{id}/report")
    public ResponseEntity<String> reportBoard(@PathVariable Integer id) {
        boardService.reportBoard(id);
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
    private String image;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}

class CommentRequest {
    private String content;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}