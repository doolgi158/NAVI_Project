package com.navi.board.repository;

import com.navi.board.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {

    // 게시글 번호로 댓글 조회
    //List<Comment> findByBoard_noOrderByCreatedAtDesc(Integer board_no);

    // 게시글의 댓글 개수
    //int countByBoard_no(Integer board_no);
}