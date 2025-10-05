package com.navi.board.controller;

import com.navi.board.domain.Board;
import com.navi.board.service.BoardService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    //게시클 목록 페이지
    @GetMapping
    public String list(Model model) {
        model.addAttribute("boards", boardService.getAllBoards());
        return "board/list";  //NAVI_Project/board/list.html
    }

    //게시글 상세 페이지
    @GetMapping("/{id}")
    public String detail(@PathVariable Integer id, Model model) {
        model.addAttribute("board", boardService.getBoard(id));
        return "board/detail";
    }

    //작성 페이지
    @GetMapping("/write")
    public String writeForm() {
        return "board/write";
    }

    //게시글 등록
    @PostMapping
    public String write(@ModelAttribute Board board) {
        boardService.createBoard(board);
        return "redirect:/board";
    }
}
