package com.navi.core.admin.service;

import com.navi.core.domain.Comment;
import com.navi.core.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminCommentService {

    private final CommentRepository commentRepository;

    // 관리자 - 댓글 삭제 (본인 확인 없이 모든 댓글 삭제 가능)
    public void deleteCommentByAdmin(Integer commentNo) {
        Comment comment = commentRepository.findById(commentNo)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다. ID: " + commentNo));

        // 대댓글이 있는지 확인
        List<Comment> replies = commentRepository.findByBoardNo(comment.getBoardNo())
                .stream()
                .filter(c -> commentNo.equals(c.getParentComment()))
                .toList();

        if (!replies.isEmpty()) {
            // 대댓글이 있으면 내용만 삭제 표시
            comment.setCommentContent("[관리자에 의해 삭제된 댓글입니다]");
            commentRepository.save(comment);
            log.info("관리자 - 댓글 내용 삭제. ID: {}", commentNo);
        } else {
            // 대댓글이 없으면 완전 삭제
            commentRepository.deleteById(commentNo);
            log.info("관리자 - 댓글 완전 삭제. ID: {}", commentNo);
        }
    }
}
