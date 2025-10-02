package com.navi.board.controller;

import com.navi.board.service.BoardService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    //게시클 목록 페이지
    @GetMapping
    public String list(Model model) {
        model.addAttribute("boards", boardService.getAllBoards());
        return "board/detail";
    }

    //게시글 상세 페이지
    @GetMapping("/{id}")
    public String detail(@PathVariable Long id, Model model) {
        model.addAttribute("board", boardService.getAllBoards());
        return "board/detail";
    }
}
