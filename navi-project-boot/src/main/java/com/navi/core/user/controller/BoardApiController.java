package com.navi.core.user.controller;

import com.navi.core.domain.Board;
import com.navi.core.domain.Comment;
import com.navi.core.user.dto.BoardDTO;
import com.navi.core.user.service.BoardService;
import com.navi.core.user.service.CommentService;
import com.navi.image.dto.ImageDTO;
import com.navi.image.service.ImageService;
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
    private final ImageService imageService;

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
            log.debug("첫 번째 게시글 createDate: {}", firstBoard.getCreateDate());
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
                    map.put("boardViewCount", board.getBoardViewCount() != null ? board.getBoardViewCount() : 0);
                    map.put("commentCount", board.getCommentCount() != null ? board.getCommentCount() : 0);
                    map.put("createDate", board.getCreateDate());
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

    // 게시글 상세 조회 (조회수 증가)
    @GetMapping("/{id}")
    public ResponseEntity<?> getBoard(@PathVariable Long id) {
        Board board = boardService.findById(id);

        // 이미지 정보 조회
        List<ImageDTO> images = imageService.getImagesByTarget("BOARD", String.valueOf(id));

        if (!images.isEmpty()) {
            board.setBoardImage(images.get(0).getPath());
        }

        return ResponseEntity.ok(board);
    }

    // 게시글 작성
    @PostMapping
    public ResponseEntity<?> createBoard(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        // 1. 게시글 저장
        Board board = Board.builder()
                .boardTitle(title)
                .boardContent(content)
                .userNo(getCurrentUserNo()) // ← 이 줄 추가!
                .build();

        Board savedBoard = boardService.save(board);

        // 2. 이미지 업로드
        if (image != null && !image.isEmpty()) {
            ImageDTO imageDTO = imageService.uploadImage(
                    image,
                    "BOARD",
                    String.valueOf(savedBoard.getBoardNo())
            );

            // 3. 이미지 경로 저장
            savedBoard.setBoardImage(imageDTO.getPath());
            boardService.save(savedBoard);
        }

        return ResponseEntity.ok(savedBoard);
    }
    // 게시글 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBoard(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "removeImage", required = false) String removeImage) {

        Board board = boardService.findById(id);

        // ✅ 권한 체크 추가
        if (!board.getUserNo().equals(getCurrentUserNo())) {
            return ResponseEntity.status(403).body("본인의 게시글만 수정할 수 있습니다.");
        }

        board.setBoardTitle(title);
        board.setBoardContent(content);

        // 이미지 삭제
        if ("true".equals(removeImage)) {
            imageService.deleteImage("BOARD", String.valueOf(id));
            board.setBoardImage(null);
        }
        // 새 이미지 업로드 (기존 이미지는 자동으로 교체됨)
        else if (image != null && !image.isEmpty()) {
            ImageDTO imageDTO = imageService.uploadImage(
                    image,
                    "BOARD",
                    String.valueOf(id)
            );
            board.setBoardImage(imageDTO.getPath());
        }

        return ResponseEntity.ok(boardService.save(board));
    }

    // 게시글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBoard(@PathVariable Long id) {
        Board board = boardService.findById(id);

        // ✅ 권한 체크 추가
        if (!board.getUserNo().equals(getCurrentUserNo())) {
            return ResponseEntity.status(403).body("본인의 게시글만 삭제할 수 있습니다.");
        }

        // 이미지 먼저 삭제
        imageService.deleteImage("BOARD", String.valueOf(id));
        boardService.delete(id);
        return ResponseEntity.ok().build();
    }

    // ==================== 좋아요 / 신고 ====================

    //게시글 좋아요
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeBoard(@PathVariable Integer id) {
        try {
            boardService.likeBoard(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("좋아요 실패 - boardNo: {}", id, e);
            return ResponseEntity.badRequest().body("좋아요에 실패했습니다.");
        }
    }

    //게시글 좋아요 취소
    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikeBoard(@PathVariable Integer id) {
        try {
            boardService.unlikeBoard(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("좋아요 취소 실패 - boardNo: {}", id, e);
            return ResponseEntity.badRequest().body("좋아요 취소에 실패했습니다.");
        }
    }

    //게시글 신고
    @PostMapping("/{id}/report")
    public ResponseEntity<?> reportBoard(@PathVariable Integer id) {
        try {
            boardService.reportBoard(id);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            log.error("신고 실패 - boardNo: {}", id, e);
            return ResponseEntity.badRequest().body("신고에 실패했습니다.");
        }
    }

    // ==================== 댓글 관련 ====================

    //게시글의 댓글 조회
    @GetMapping("/{id}/comment")
    public ResponseEntity<?> getComment(@PathVariable Integer id) {
        try {
            List<Comment> comments = commentService.getCommentsByBoardNo(id);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            log.error("댓글 조회 실패 - boardNo: {}", id, e);
            return ResponseEntity.badRequest().body("댓글 조회에 실패했습니다.");
        }
    }

    //댓글 작성
    @PostMapping("/{id}/comment")
    public ResponseEntity<?> createComment(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {

        try {
            Integer userNo = getCurrentUserNo();
            String content = request.get("content");

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("댓글 내용을 입력해주세요.");
            }

            Comment comment = commentService.createComment(id, userNo, content);
            return ResponseEntity.ok(comment);

        } catch (Exception e) {
            log.error("댓글 작성 실패 - boardNo: {}", id, e);
            return ResponseEntity.badRequest().body("댓글 작성에 실패했습니다.");
        }
    }

    //대댓글 작성
    @PostMapping("/{id}/comment/{parentCommentNo}/reply")
    public ResponseEntity<?> createReply(
            @PathVariable Integer id,
            @PathVariable Integer parentCommentNo,
            @RequestBody Map<String, String> request) {

        try {
            Integer userNo = getCurrentUserNo();
            String content = request.get("content");

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("답글 내용을 입력해주세요.");
            }

            Comment reply = commentService.createReply(id, parentCommentNo, userNo, content);
            return ResponseEntity.ok(reply);

        } catch (Exception e) {
            log.error("답글 작성 실패 - boardNo: {}, parentCommentNo: {}", id, parentCommentNo, e);
            return ResponseEntity.badRequest().body("답글 작성에 실패했습니다.");
        }
    }

    //댓글 삭제
    @DeleteMapping("/comment/{commentNo}")
    public ResponseEntity<?> deleteComment(@PathVariable Integer commentNo) {
        try {
            Integer userNo = getCurrentUserNo();
            commentService.deleteComment(commentNo, userNo);
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            log.error("댓글 삭제 실패 - commentNo: {}", commentNo, e);
            return ResponseEntity.badRequest().body("댓글 삭제에 실패했습니다.");
        }
    }

    //댓글 신고
    @PostMapping("/comment/{commentNo}/report")
    public ResponseEntity<?> reportComment(@PathVariable Integer commentNo) {
        try {
            commentService.reportComment(commentNo);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            log.error("댓글 신고 실패 - commentNo: {}", commentNo, e);
            return ResponseEntity.badRequest().body("댓글 신고에 실패했습니다.");
        }
    }
}