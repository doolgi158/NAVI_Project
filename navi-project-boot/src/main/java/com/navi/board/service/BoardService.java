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

    //게시글 목록 조회
    public List<Board> getAllBoards() {
        return boardRepository.findAll();
    }
    // 게시글 작성
//    public void createBoard(Board board) {
//        boardRepository.save(board);
//    }
    // 게시글 상세 조회
    public Board getBoard(Integer id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
    }

    // 게시글 작성
    public void createBoard(Board board) {
        boardRepository.save(board);
    }
    // 게시글 삭제
    public void deleteBoard(Integer id) {
        boardRepository.deleteById(id);
    }

}