package com.navi.board.controller;

import com.navi.board.domain.Board;
import com.navi.board.service.BoardService;
import com.navi.board.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final CommentService commentService;

    // ========== 디버깅용 테스트 메서드 ==========
    @GetMapping("/debug")
    @ResponseBody
    public String debug() {
        try {
            List<Board> boards = boardService.getAllBoards();
            return "성공! 게시글 개수: " + boards.size();
        } catch (Exception e) {
            return "에러 발생: " + e.getMessage();
        }
    }

    // ========== 기본 메서드들 ==========

    @GetMapping
    public String index() {
        return "redirect:/board/list";
    }

    @GetMapping("/list")
    public String list(Model model) {
        try {
            System.out.println("========== /board/list 호출됨 ==========");

            List<Board> boards = boardService.getAllBoards();
            System.out.println("게시글 개수: " + boards.size());

            // 첫 번째 게시글 정보 출력 (있다면)
            if (!boards.isEmpty()) {
                Board firstBoard = boards.get(0);
                System.out.println("첫 번째 게시글: " + firstBoard);
            }

            model.addAttribute("boards", boards);
            System.out.println("========== 모델에 boards 추가 완료 ==========");

            return "board/list";
        } catch (Exception e) {
            System.err.println("========== 에러 발생! ==========");
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/write")
    public String boardWrite() {
        return "board/write";
    }

    @PostMapping("/write")
    public String submitPost(@RequestParam(required = false) String title,
                             @RequestParam(required = false) String content,
                             @RequestParam(required = false) String image
                            ) {
        System.out.println("=====================================");
        System.out.println("POST /board/write 요청 받음!");
        System.out.println("제목: " + title);
        System.out.println("내용: " + content);
        System.out.println("=====================================");

        if (title == null || title.trim().isEmpty()) {
            System.out.println("❌ 제목이 없습니다!");
            return "redirect:/board/list";
        }

        if (content == null || content.trim().isEmpty()) {
            System.out.println("❌ 내용이 없습니다!");
            return "redirect:/board/list";
        }

        try {
            System.out.println("✅ 게시글 저장 시작...");
            boardService.createBoard(title, content, image);
            System.out.println("✅ 게시글 저장 완료!");
        } catch (Exception e) {
            System.out.println("❌ 저장 중 에러 발생:");
            e.printStackTrace();
        }

        return "redirect:/board/list";
    }

    @GetMapping("/{id}")
    public String detail(@PathVariable Integer id, Model model) {
        try {
            System.out.println("========== 게시글 상세 조회: " + id + " ==========");

            Board board = boardService.getBoard(id);
            System.out.println("게시글 정보: " + board);

            model.addAttribute("board", board);
            model.addAttribute("comments", commentService.getCommentsByBoardNo(id));
            model.addAttribute("commentCount", commentService.getCommentCount(id));

            return "board/detail";
        } catch (Exception e) {
            System.err.println("========== 에러 발생! ==========");
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/{id}/comment")
    public String addComment(@PathVariable Integer id,
                             @RequestParam String comment) {
        commentService.createComment(id, comment);
        return "redirect:/board/" + id;
    }

    @PostMapping("/comment/{commentId}/delete")
    public String deleteComment(@PathVariable Integer commentId,
                                @RequestParam Integer boardId) {
        commentService.deleteComment(commentId);
        return "redirect:/board/" + boardId;
    }

    @PostMapping("/{id}/report")
    @ResponseBody
    public String reportBoard(@PathVariable Integer id) {
        try {
            boardService.reportBoard(id);
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }

    @GetMapping("/test")
    @ResponseBody
    public String test() {
        return "서버 작동 중!";
    }
}