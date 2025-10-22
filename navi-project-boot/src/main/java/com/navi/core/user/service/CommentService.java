package com.navi.core.user.service;

import com.navi.core.domain.Comment;
import com.navi.core.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;

    /**
     * 게시글의 댓글 목록 조회 (최신순)
     */
    @Transactional(readOnly = true)
    public List<Comment> getCommentsByBoardNo(Integer boardNo) {
        return commentRepository.findByBoardNoOrderByCreateDateDesc(boardNo);
    }

    /**
     * 댓글 작성
     * @param boardNo 게시글 번호
     * @param userNo 작성자 번호
     * @param content 댓글 내용
     */
    public Comment createComment(Integer boardNo, Integer userNo, String content) {
        Comment comment = Comment.builder()
                .boardNo(boardNo)
                .commentContent(content)
                .userNo(userNo)
                .commentDepth(0)
                .parentComment(null)
                .reportCount(0)
                .build();

        Comment savedComment = commentRepository.save(comment);
        log.info("댓글 작성 완료. 게시글: {}, 작성자: {}", boardNo, userNo);
        return savedComment;
    }

    /**
     * 대댓글 작성
     * @param boardNo 게시글 번호
     * @param parentCommentNo 부모 댓글 번호
     * @param userNo 작성자 번호
     * @param content 댓글 내용
     */
    public Comment createReply(Integer boardNo, Integer parentCommentNo, Integer userNo, String content) {
        Comment parentComment = commentRepository.findById(parentCommentNo)
                .orElseThrow(() -> new RuntimeException("부모 댓글을 찾을 수 없습니다. ID: " + parentCommentNo));

        Comment reply = Comment.builder()
                .boardNo(boardNo)
                .commentContent(content)
                .userNo(userNo)
                .parentComment(parentCommentNo)
                .commentDepth(parentComment.getCommentDepth() + 1)
                .reportCount(0)
                .build();

        Comment savedReply = commentRepository.save(reply);
        log.info("대댓글 작성 완료. 부모댓글: {}, 작성자: {}", parentCommentNo, userNo);
        return savedReply;
    }

    /**
     * 댓글 삭제 (본인만 가능)
     * @param commentNo 댓글 번호
     * @param currentUserNo 현재 로그인한 사용자 번호
     */
    public void deleteComment(Integer commentNo, Integer currentUserNo) {
        Comment comment = commentRepository.findById(commentNo)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다. ID: " + commentNo));

        // 본인 확인
        if (!comment.isAuthor(currentUserNo)) {
            throw new RuntimeException("본인이 작성한 댓글만 삭제할 수 있습니다.");
        }

        // 대댓글이 있는지 확인
        List<Comment> replies = commentRepository.findByBoardNo(comment.getBoardNo())
                .stream()
                .filter(c -> commentNo.equals(c.getParentComment()))
                .toList();

        if (!replies.isEmpty()) {
            // 대댓글이 있으면 내용만 삭제 표시
            comment.setCommentContent("[삭제된 댓글입니다]");
            commentRepository.save(comment);
            log.info("댓글 내용 삭제 (대댓글 존재). ID: {}", commentNo);
        } else {
            // 대댓글이 없으면 완전 삭제
            commentRepository.deleteById(commentNo);
            log.info("댓글 완전 삭제. ID: {}", commentNo);
        }
    }

    /**
     * 댓글 신고
     */
    public void reportComment(Integer commentNo) {
        Comment comment = commentRepository.findById(commentNo)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다. ID: " + commentNo));

        comment.setReportCount(comment.getReportCount() + 1);
        commentRepository.save(comment);
        log.info("댓글 신고 완료. ID: {}, 신고 횟수: {}", commentNo, comment.getReportCount());
    }

    /**
     * 게시글의 댓글 개수 조회
     */
    @Transactional(readOnly = true)
    public int getCommentCount(Integer boardNo) {
        return commentRepository.countByBoardNo(boardNo);
    }

    /**
     * 댓글 상세 조회
     */
    @Transactional(readOnly = true)
    public Comment getComment(Integer commentNo) {
        return commentRepository.findById(commentNo)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다. ID: " + commentNo));
    }
}