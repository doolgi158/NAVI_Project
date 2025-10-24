package com.navi.core.user.service;

import com.navi.core.domain.Board;
import com.navi.core.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

    private final BoardRepository boardRepository;

    // 전체 게시글 조회 (최신순)
    @Transactional(readOnly = true)
    public List<Board> getAllBoards() {
        return boardRepository.findAllByOrderByCreateDateDesc();
    }

    // 게시글 검색 (제목 + 내용)
    @Transactional(readOnly = true)
    public List<Board> searchBoards(String keyword) {
        return boardRepository.searchByKeyword(keyword);
    }

    // 게시글 작성 (TODO: 로그인한 사용자 정보 받기)
    public void createBoard(String title, String content, String image) {
        Board board = Board.builder()
                .boardTitle(title)
                .boardContent(content)
                .boardImage(image)
                .boardGood(0)
                .reportCount(0)
                .userNo(1)  // TODO: 로그인한 사용자 번호로 변경
                .build();

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

    // 게시글 수정 (TODO: 본인 확인)
    public void updateBoard(Integer id, String title, String content, String image) {
        Board board = getBoard(id);
        // TODO: 본인이 쓴 글인지 확인
        board.setBoardTitle(title);
        board.setBoardContent(content);
        board.setBoardImage(image);
        boardRepository.save(board);
        System.out.println("게시글 수정 완료. ID: " + id);
    }

    // 게시글 삭제 (TODO: 본인 확인)
    public void deleteBoard(Integer id) {
        Board board = getBoard(id);
        // TODO: 본인이 쓴 글인지 확인
        boardRepository.deleteById(id);
        System.out.println("게시글 삭제 완료. ID: " + id);
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
        if (board.getBoardGood() > 0) {
            board.setBoardGood(board.getBoardGood() - 1);
            boardRepository.save(board);
            System.out.println("좋아요 취소 완료! 현재 좋아요 수: " + board.getBoardGood());
        }
    }



}