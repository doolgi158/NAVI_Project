package com.navi.core.user.service;

import com.navi.core.domain.Board;
import com.navi.core.repository.BoardRepository;
import com.navi.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

    private final BoardRepository boardRepository;
    private final ImageService imageService;

    //전체 게시글 조회 (페이징)
    @Transactional(readOnly = true)
    public Page<Board> getAllBoards(Pageable pageable) {
        return boardRepository.findAll(pageable);
    }
    //게시글 검색
    @Transactional(readOnly = true)
    public Page<Board> searchBoards(String keyword, Pageable pageable) {
        return boardRepository.findByBoardTitleContainingOrBoardContentContaining(
                keyword, keyword, pageable
        );
    }

    public Board createBoard(String title, String content, Integer userNo, MultipartFile imageFile) {
        Board board = Board.builder()
                .boardTitle(title)
                .boardContent(content)
                .userNo(userNo)
                .boardGood(0)
                .reportCount(0)
                .build();

        Board savedBoard = boardRepository.save(board);
        log.info("게시글 작성 완료. ID: {}", savedBoard.getBoardNo());

        // 이미지 업로드
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                var imageDTO = imageService.uploadImage(
                        imageFile,
                        "BOARD",  // targetType
                        savedBoard.getBoardNo().toString()  // targetId
                );
                savedBoard.setBoardImage(imageDTO.getPath());
                boardRepository.save(savedBoard);
                log.info("이미지 업로드 완료: {}", imageDTO.getPath());
            } catch (Exception e) {
                log.error("이미지 업로드 실패", e);
            }
        }

        return savedBoard;
    }

    @Transactional
    public Board getBoard(Integer id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));

        board.setBoardViewCount(board.getBoardViewCount() + 1);
        boardRepository.save(board);

        return board;
    }

    public Board updateBoard(Integer id, String title, String content, Integer currentUserNo, MultipartFile imageFile) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));

        if (!board.isAuthor(currentUserNo)) {
            throw new RuntimeException("본인이 작성한 게시글만 수정할 수 있습니다.");
        }

        board.setBoardTitle(title);
        board.setBoardContent(content);

        // 이미지 업데이트
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                // 기존 이미지 삭제
                imageService.deleteImage("BOARD", id.toString());

                // 새 이미지 업로드
                var imageDTO = imageService.uploadImage(imageFile, "BOARD", id.toString());
                board.setBoardImage(imageDTO.getPath());
                log.info("이미지 업데이트 완료: {}", imageDTO.getPath());
            } catch (Exception e) {
                log.error("이미지 업데이트 실패", e);
            }
        }

        Board updatedBoard = boardRepository.save(board);
        log.info("게시글 수정 완료. ID: {}", id);
        return updatedBoard;
    }

    public void deleteBoard(Integer id, Integer currentUserNo) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));

        if (!board.isAuthor(currentUserNo)) {
            throw new RuntimeException("본인이 작성한 게시글만 삭제할 수 있습니다.");
        }

        // 이미지 삭제
        try {
            imageService.deleteImage("BOARD", id.toString());
            log.info("이미지 삭제 완료");
        } catch (Exception e) {
            log.warn("이미지 삭제 실패 또는 이미지 없음", e);
        }

        boardRepository.deleteById(id);
        log.info("게시글 삭제 완료. ID: {}", id);
    }

    public void reportBoard(Integer id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));

        board.setReportCount(board.getReportCount() + 1);
        boardRepository.save(board);
        log.info("게시글 신고 완료. ID: {}, 신고 횟수: {}", id, board.getReportCount());
    }

    public void likeBoard(Integer id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));

        board.setBoardGood(board.getBoardGood() + 1);
        boardRepository.save(board);
        log.info("좋아요 완료. ID: {}, 좋아요 수: {}", id, board.getBoardGood());
    }

    public void unlikeBoard(Integer id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. ID: " + id));

        if (board.getBoardGood() > 0) {
            board.setBoardGood(board.getBoardGood() - 1);
            boardRepository.save(board);
            log.info("좋아요 취소 완료. ID: {}, 좋아요 수: {}", id, board.getBoardGood());
        }
    }
}