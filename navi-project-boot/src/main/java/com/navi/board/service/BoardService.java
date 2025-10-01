package com.navi.board.service;

import com.navi.board.domain.Board;
import com.navi.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService { //비즈니스 로직

    private final BoardRepository boardRepository;

    // 게시글 목록 조회
    public List<Board> getAllBoards() {
        return boardRepository.findAll();
    }
    // 게시글 작성
    public Board createBoard(Board board) {
        return boardRepository.save(board);
    }
    // 게시글 삭제
    public void deleteBoard(Long id) {
        boardRepository.deleteById(id);
    }
}