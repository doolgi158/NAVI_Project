package com.navi.core.user.service;

import com.navi.core.domain.Comment;
import com.navi.core.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;

    // 게시글의 댓글 목록 조회
    @Transactional(readOnly = true)
    public List<Comment> getCommentsByBoardNo(Integer boardNo) {
        return commentRepository.findByBoardNo(boardNo);
    }

    // 댓글 작성 (TODO: 로그인한 사용자 정보 받기)
    public void createComment(Integer boardNo, String content) {
        Comment comment = Comment.builder()
                .boardNo(boardNo)
                .commentContent(content)
                .userNo(1)  // TODO: 로그인한 사용자 번호로 변경
                .commentDepth(0)
                .parentComment(null)
                .reportCount(0)
                .build();

        commentRepository.save(comment);
        System.out.println("댓글 작성 완료: " + comment);
    }

    // 대댓글 작성 (TODO: 로그인한 사용자 정보 받기)
    public void createReply(Integer boardNo, Integer parentCommentNo, String content) {
        Comment parentComment = commentRepository.findById(parentCommentNo)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        Comment reply = Comment.builder()
                .boardNo(boardNo)
                .commentContent(content)
                .userNo(1)  // TODO: 로그인한 사용자 번호로 변경
                .parentComment(parentCommentNo)
                .commentDepth(parentComment.getCommentDepth() + 1)
                .reportCount(0)
                .build();

        commentRepository.save(reply);
        System.out.println("대댓글 작성 완료: " + reply);
    }

    // 댓글 삭제 (TODO: 본인 확인)
    public void deleteComment(Integer commentNo) {
        Comment comment = commentRepository.findById(commentNo)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));
        // TODO: 본인이 쓴 댓글인지 확인
        commentRepository.deleteById(commentNo);
        System.out.println("댓글 삭제 완료. ID: " + commentNo);
    }

    // 댓글 신고
    public void reportComment(Integer commentNo) {
        Comment comment = commentRepository.findById(commentNo)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        comment.setReportCount(comment.getReportCount() + 1);
        commentRepository.save(comment);
        System.out.println("댓글 신고 완료. 현재 신고 횟수: " + comment.getReportCount());
    }

    // 게시글의 댓글 개수 조회
    @Transactional(readOnly = true)
    public int getCommentCount(Integer boardNo) {
        return commentRepository.countByBoardNo(boardNo);
    }
}