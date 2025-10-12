package com.navi.board.controller;

import com.navi.board.domain.Board;
import com.navi.board.service.BoardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
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

    // /board 접속 시 자동으로 /board/list로 리다이렉트
    @GetMapping
    public String index() {
        return "redirect:/board/list";
    }

    @GetMapping("/list")
    public String list(Model model) {
        List<Board> boards = boardService.getAllBoards();
        System.out.println("게시글 개수: " + boards.size());
        model.addAttribute("boards", boards);
        return "board/list";
    }

    // 글쓰기 페이지 - http://localhost:8080/board/write
    @GetMapping("/write")
    public String boardWrite() {
        return "board/write";  // write.html을 보여줌
    }

    // 게시글 등록 처리
    @PostMapping("/write")
    public String submitPost(@RequestParam(required = false) String title,
                             @RequestParam(required = false) String content,
                             HttpServletRequest request) {
        System.out.println("=====================================");
        System.out.println("POST /board/write 요청 받음!");
        System.out.println("제목 파라미터: " + title);
        System.out.println("내용 파라미터: " + content);
        System.out.println("모든 파라미터: " + request.getParameterMap().keySet());
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
            boardService.createBoard(title, content);
            System.out.println("✅ 게시글 저장 완료!");
        } catch (Exception e) {
            System.out.println("❌ 저장 중 에러 발생:");
            e.printStackTrace();
        }

        return "redirect:/board/list";
    }

    // 게시글 상세 페이지 - 맨 마지막에 배치
    @GetMapping("/{id}")
    public String detail(@PathVariable Integer id, Model model) {
        model.addAttribute("board", boardService.getBoard(id));
        return "board/detail";
    }


}






