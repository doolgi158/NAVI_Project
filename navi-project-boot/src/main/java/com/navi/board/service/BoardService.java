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

    /**
     * 전체 게시글 조회
     */
    @Transactional(readOnly = true)
    public List<Board> getAllBoards() {
        return boardRepository.findAll();
    }

    /**
     * 게시글 작성
     * @param title 제목
     * @param content 내용
     */
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

    /**
     * 게시글 상세 조회
     * @param id 게시글 번호
     * @return Board 엔티티
     */
    @Transactional(readOnly = true)
    public Board getBoard(Integer id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));
    }

    /**
     * 게시글 신고
     * @param id 게시글 번호
     */
    public void reportBoard(Integer id) {
        Board board = getBoard(id);
        board.setReportCount(board.getReportCount() + 1);
        boardRepository.save(board);
        System.out.println("게시글 신고 완료. 현재 신고 횟수: " + board.getReportCount());
    }
}