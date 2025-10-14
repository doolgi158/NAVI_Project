package com.navi.board.service;

import com.navi.board.domain.Board;
import com.navi.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;

    public List<Board> getAllBoards() {
        return boardRepository.findAll();
    }

    public void createBoard(String title, String content) {
        Board board = new Board();
        board.setBoard_title(title);
        board.setBoard_content(content);
        board.setBoard_good(0);
        board.setReport_count(0);
        board.setUser_no(1);
        board.setCreate_date(LocalDateTime.now());
        board.setUpdate_date(LocalDateTime.now());

        System.out.println("저장 전 Board: " + board);
        boardRepository.save(board);
        System.out.println("저장 완료!");
    }

    public Board getBoard(Integer id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
    }

    public void reportBoard(Integer id) {
        Board board = getBoard(id);
        board.setReport_count(board.getReport_count() + 1);
        boardRepository.save(board);
    }
}