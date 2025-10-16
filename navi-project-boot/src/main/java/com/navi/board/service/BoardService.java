package com.navi.board.service;

import com.navi.board.domain.Board;
import com.navi.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

    private final BoardRepository boardRepository;


    // 전체 게시글 조회
    @Transactional(readOnly = true)
    public List<Board> getAllBoards() {
        return boardRepository.findAll();
    }

    //게시글 검색 (제목 + 내용)
    @Transactional(readOnly = true)
    public List<Board> searchBoards(String keyword) {
        return boardRepository.searchByKeyword(keyword);
    }

    // 게시글 작성
    public void createBoard(String title, String content) {
        // Builder 패턴 사용 (더 깔끔한 코드)
        Board board = Board.builder()
                .boardTitle(title)
                .boardContent(content)
                .boardGood(0)
                .reportCount(0)
                .userNo(1)  // TODO: 실제로는 로그인한 사용자 번호를 받아야 함
                .build();

        // createDate, updateDate는 @CreationTimestamp, @UpdateTimestamp가 자동 설정
        System.out.println("저장 전 Board: " + board);
        boardRepository.save(board);
        System.out.println("저장 완료!");
    }


    // 게시글 상세 조회
    @Transactional(readOnly = true)
    public Board getBoard(Integer id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));
    }


     // 게시글 신고
    public void reportBoard(Integer id) {
        Board board = getBoard(id);
        board.setReportCount(board.getReportCount() + 1);
        boardRepository.save(board);
        System.out.println("게시글 신고 완료. 현재 신고 횟수: " + board.getReportCount());
    }

    // 게시글 좋아요
    public void likeBoard(Integer id) {
        Board board = getBoard(id);
        board.setBoardGood(board.getBoardGood() + 1);
        boardRepository.save(board);
        System.out.println("좋아요 완료! 현재 좋아요 수: " + board.getBoardGood());
    }

    // 게시글 좋아요 취소
    public void unlikeBoard(Integer id) {
        Board board = getBoard(id);
        // 좋아요 수가 0보다 클 때만 감소
        if (board.getBoardGood() > 0) {
            board.setBoardGood(board.getBoardGood() - 1);
            boardRepository.save(board);
            System.out.println("좋아요 취소 완료! 현재 좋아요 수: " + board.getBoardGood());
        }
    }
}