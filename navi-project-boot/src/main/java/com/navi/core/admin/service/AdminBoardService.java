package com.navi.core.admin.service;

import com.navi.core.admin.controller.BoardStatistics;
import com.navi.core.domain.Board;
import com.navi.core.repository.BoardRepository;
import com.navi.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminBoardService {

    private final BoardRepository boardRepository;
    private final ImageService imageService;

    /**
     * 전체 게시글 조회 (관리자)
     */
    @Transactional(readOnly = true)
    public List<Board> getAllBoards() {
        return boardRepository.findAllByOrderByCreateDateDesc();
    }

    /**
     * 게시글 검색 (관리자)
     */
    @Transactional(readOnly = true)
    public List<Board> searchBoards(String keyword) {
        return boardRepository.searchByKeyword(keyword);
    }

    /**
     * 게시글 상세 조회 (관리자 - 조회수 증가 없음)
     */
    @Transactional(readOnly = true)
    public Board getBoard(Integer id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));
    }

    /**
     * 게시글 삭제 (관리자 - 모든 게시글 삭제 가능)
     */
    public void deleteBoard(Integer id) {
        if (!boardRepository.existsById(id)) {
            throw new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id);
        }

        // 이미지 삭제
        try {
            imageService.deleteImage("BOARD", id.toString());
            log.info("[관리자] 게시글 이미지 삭제 완료: {}", id);
        } catch (Exception e) {
            log.warn("[관리자] 게시글 이미지 삭제 실패 또는 이미지 없음: {}", id);
        }

        // 게시글 삭제
        boardRepository.deleteById(id);
        log.info("[관리자] 게시글 삭제 완료. ID: {}", id);
    }

    /**
     * 신고된 게시글 목록 조회 (신고 횟수 1 이상)
     */
    @Transactional(readOnly = true)
    public List<Board> getReportedBoards() {
        return boardRepository.findAllByOrderByCreateDateDesc()
                .stream()
                .filter(board -> board.getReportCount() != null && board.getReportCount() > 0)
                .sorted((b1, b2) -> b2.getReportCount().compareTo(b1.getReportCount())) // 신고 많은 순
                .collect(Collectors.toList());
    }

    /**
     * 게시글 통계 조회
     */
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