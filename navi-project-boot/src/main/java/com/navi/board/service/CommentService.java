package com.navi.board.service;

import com.navi.board.domain.Comment;
import com.navi.board.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;

    /**
     * 게시글의 댓글 목록 조회
     * @param boardNo 게시글 번호
     * @return 댓글 목록
     */
    @Transactional(readOnly = true)
    public List<Comment> getCommentsByBoardNo(Integer boardNo) {
        return commentRepository.findByBoardNo(boardNo);
    }

    /**
     * 댓글 작성
     * @param boardNo 게시글 번호
     * @param content 댓글 내용
     */
    public void createComment(Integer boardNo, String content) {
        // Builder 패턴 사용
        Comment comment = Comment.builder()
                .boardNo(boardNo)
                .commentContent(content)
                .userNo(1)  // TODO: 실제로는 로그인한 사용자 번호를 받아야 함
                .build();

        // createDate, updateDate는 @CreationTimestamp, @UpdateTimestamp가 자동 설정
        commentRepository.save(comment);
        System.out.println("댓글 작성 완료: " + comment);
    }

    /**
     * 댓글 삭제
     * @param commentNo 댓글 번호
     */
    public void deleteComment(Integer commentNo) {
        if (!commentRepository.existsById(commentNo)) {
            throw new RuntimeException("댓글을 찾을 수 없습니다. ID: " + commentNo);
        }
        commentRepository.deleteById(commentNo);
        System.out.println("댓글 삭제 완료. ID: " + commentNo);
    }

    /**
     * 게시글의 댓글 개수 조회
     * @param boardNo 게시글 번호
     * @return 댓글 개수
     */
    @Transactional(readOnly = true)
    public int getCommentCount(Integer boardNo) {
        return commentRepository.countByBoardNo(boardNo);
    }
}