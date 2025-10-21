package com.navi.core.admin.service;

import com.navi.core.admin.controller.BoardStatistics;
import com.navi.core.domain.Board;
import com.navi.core.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminBoardService {

    private final BoardRepository boardRepository;

    // 전체 게시글 조회 (관리자)
    @Transactional(readOnly = true)
    public List<Board> getAllBoards() {
        return boardRepository.findAllByOrderByCreateDateDesc();
    }

    // 게시글 상세 조회 (관리자)
    @Transactional(readOnly = true)
    public Board getBoard(Integer id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));
    }

    // 게시글 삭제 (관리자 - 모든 게시글 삭제 가능)
    public void deleteBoard(Integer id) {
        if (!boardRepository.existsById(id)) {
            throw new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id);
        }
        boardRepository.deleteById(id);
        System.out.println("[관리자] 게시글 삭제 완료. ID: " + id);
    }

    // 신고된 게시글 목록 조회 (신고 횟수 1 이상)
    @Transactional(readOnly = true)
    public List<Board> getReportedBoards() {
        return boardRepository.findAllByOrderByCreateDateDesc()
                .stream()
                .filter(board -> board.getReportCount() != null && board.getReportCount() > 0)
                .collect(Collectors.toList());
    }

    // 게시글 통계 조회
    @Transactional(readOnly = true)
    public BoardStatistics getStatistics() {
        List<Board> allBoards = boardRepository.findAll();

        // 전체 게시글 수
        Long totalBoards = (long) allBoards.size();

        // 오늘 작성된 게시글 수
        LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIN);
        Long todayBoards = allBoards.stream()
                .filter(board -> board.getCreateDate().isAfter(todayStart))
                .count();

        // 신고된 게시글 수
        Long reportedBoards = allBoards.stream()
                .filter(board -> board.getReportCount() != null && board.getReportCount() > 0)
                .count();

        return new BoardStatistics(totalBoards, todayBoards, reportedBoards);
    }
}