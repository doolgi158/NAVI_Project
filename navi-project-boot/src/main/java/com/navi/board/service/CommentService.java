package com.navi.board.service;

import com.navi.board.domain.Comment;
import com.navi.board.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public List<Comment> getCommentsByBoardNo(Integer boardNo) {
        return commentRepository.findByBoardNo(boardNo);
    }

    public void createComment(Integer boardNo, String content) {
        Comment comment = new Comment();
        comment.setBoardNo(boardNo);
        comment.setCommentContent(content);
        comment.setUserNo(1);
        comment.setCreateDate(LocalDateTime.now());
        comment.setUpdateDate(LocalDateTime.now());

        commentRepository.save(comment);
    }

    //댓글삭제
    public void deleteComment(Integer commentNo) {
        commentRepository.deleteById(commentNo);
    }

    //댓글개수
    @Transactional(readOnly = true)
    public int getCommentCount(Integer boardNo) {
        return commentRepository.countByBoardNo(boardNo);
    }
}