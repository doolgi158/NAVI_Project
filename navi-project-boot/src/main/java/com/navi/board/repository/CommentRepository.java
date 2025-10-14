package com.navi.board.repository;

import com.navi.board.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {

    // 메서드명 규칙으로 자동 생성
    List<Comment> findByBoardNoOrderByCreateDateDesc(Integer boardNo);

    int countByBoardNo(Integer boardNo);

    // 게시글 번호로 댓글 조회
    @Query("SELECT c FROM Comment c WHERE c.boardNo = :boardNo ORDER BY c.createDate DESC")
    List<Comment> findByBoardNo(@Param("boardNo") Integer boardNo);

    // 게시글의 댓글 개수

}