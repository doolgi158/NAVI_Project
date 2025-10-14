package com.navi.board.repository;

import com.navi.board.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {

    // 게시글 번호로 댓글 조회
    @Query("SELECT c FROM Comment c WHERE c.board_no = :boardNo ORDER BY c.createdAt DESC")
    List<Comment> findByBoardNo(@Param("boardNo") Integer boardNo);

    // 게시글의 댓글 개수
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.board_no = :boardNo")
    int countByBoardNo(@Param("boardNo") Integer boardNo);
}