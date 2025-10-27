package com.navi.core.user.controller;

import com.navi.core.domain.Board;
import com.navi.core.domain.Comment;
import com.navi.core.user.dto.BoardDTO;
import com.navi.core.user.service.BoardService;
import com.navi.core.user.service.CommentService;
import com.navi.user.domain.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BoardApiController {

    private final BoardService boardService;
    private final CommentService commentService;

    //현재 로그인한 사용자 번호 가져오기
    private Integer getCurrentUserNo() {
        return 1; // 테스트용 (JWT 적용 시 복원)
    }

    //게시글 검색
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchBoards(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createDate").descending());
        Page<Board> boardPage = boardService.searchBoards(keyword, pageable);

        if (!boardPage.isEmpty()) {
            Board firstBoard = boardPage.getContent().getFirst();
            System.out.println("첫 번째 게시글 createDate: " + firstBoard.getCreateDate());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("boards", boardPage.getContent());
        response.put("currentPage", boardPage.getNumber());
        response.put("totalItems", boardPage.getTotalElements());
        response.put("totalPages", boardPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    // 목록 조회 (조회수 증가 없음)
    @GetMapping
    public ResponseEntity<?> getAllBoards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<Board> boardPage = boardService.getAllBoards(page, size);

        List<Map<String, Object>> boards = boardPage.getContent().stream()
                .map(board -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("boardNo", board.getBoardNo());
                    map.put("boardTitle", board.getBoardTitle());
                    map.put("userNo", board.getUserNo());
                    map.put("boardGood", board.getBoardGood() != null ? board.getBoardGood() : 0);
                    map.put("boardViewCount", board.getBoardViewCount() != null ? board.getBoardViewCount() : 0);  // ✅
                    map.put("commentCount", board.getCommentCount() != null ? board.getCommentCount() : 0);  // ✅
                    map.put("createDate", board.getCreateDate());  // ✅
                    map.put("boardImage", board.getBoardImage());
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("boards", boards);
        response.put("currentPage", boardPage.getNumber());
        response.put("totalPages", boardPage.getTotalPages());
        response.put("totalItems", boardPage.getTotalElements());

        return ResponseEntity.ok(response);
    }

    // 상세 조회 (조회수 증가)
    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoardById(@PathVariable Integer id) {
        Board board = boardService.getBoardById(id);  // ✅ 여기서 조회수 증가
        return ResponseEntity.ok(board);
    }

    //게시글 작성
    @PostMapping
    public ResponseEntity<Board> createBoard(
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) MultipartFile image) {

        Integer userNo = getCurrentUserNo();
        Board board = boardService.createBoard(title, content, userNo, image);
        return ResponseEntity.ok(board);
    }

    //이미지 업로드
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam MultipartFile file) {
        return ResponseEntity.ok(Map.of("imageUrl", "/images/temp/" + file.getOriginalFilename()));
    }

    //게시글 수정
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

    //게시글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Integer id) {
        Integer userNo = getCurrentUserNo();
        boardService.deleteBoard(id, userNo);
        return ResponseEntity.noContent().build();
    }

    //게시글 좋아요
    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likeBoard(@PathVariable Integer id) {
        boardService.likeBoard(id);
        return ResponseEntity.ok().build();
    }

    //게시글 좋아요 취소
    @DeleteMapping("/{id}/like")
    public ResponseEntity<Void> unlikeBoard(@PathVariable Integer id) {
        boardService.unlikeBoard(id);
        return ResponseEntity.ok().build();
    }

    //게시글 신고
    @PostMapping("/{id}/report")
    public ResponseEntity<Void> reportBoard(@PathVariable Integer id) {
        boardService.reportBoard(id);
        return ResponseEntity.ok().build();
    }

    //게시글의 댓글 조회
    @GetMapping("/{id}/comment")
    public ResponseEntity<List<Comment>> getComment(@PathVariable Integer id) {
        List<Comment> comments = commentService.getCommentsByBoardNo(id);
        return ResponseEntity.ok(comments);
    }

    //댓글 작성
    @PostMapping("/{id}/comment")
    public ResponseEntity<Comment> createComment(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {

        Integer userNo = getCurrentUserNo();
        String content = request.get("content");

        Comment comment = commentService.createComment(id, userNo, content);
        return ResponseEntity.ok(comment);
    }

    //대댓글 작성
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

    //댓글 삭제
    @DeleteMapping("/comment/{commentNo}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer commentNo) {
        Integer userNo = getCurrentUserNo();
        commentService.deleteComment(commentNo, userNo);
        return ResponseEntity.noContent().build();
    }

    //댓글 신고
    @PostMapping("/comment/{commentNo}/report")
    public ResponseEntity<Void> reportComment(@PathVariable Integer commentNo) {
        commentService.reportComment(commentNo);
        return ResponseEntity.ok().build();
    }
}
