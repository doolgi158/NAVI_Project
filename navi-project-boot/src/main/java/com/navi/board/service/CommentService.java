package com.navi.board.service;

import com.navi.board.domain.Comment;
import com.navi.board.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    // 댓글 목록 조회
    public List<Comment> getCommentsByBoardNo(Integer boardNo) {
        // 일단 전체 조회 (나중에 수정)
        return commentRepository.findAll();
    }

    // 댓글 작성
    public void createComment(Integer boardNo, String content) {
        Comment comment = new Comment();
        comment.setBoard_no(boardNo);
        comment.setComment_content(content);
        comment.setUser_no(1);  // 임시 사용자 번호

        commentRepository.save(comment);
        System.out.println("댓글 작성 완료: " + comment);
    }

    // 댓글 삭제
    public void deleteComment(Integer commentNo) {
        commentRepository.deleteById(commentNo);
    }

    // 댓글 개수
    public int getCommentCount(Integer boardNo) {
        // 일단 전체 개수 반환 (나중에 수정)
        return (int) commentRepository.count();
    }
}