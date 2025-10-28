package com.navi.core.repository;

import com.navi.core.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {

    // 게시글의 모든 댓글 조회
    List<Comment> findByBoardNo(Integer boardNo);


    // 최신순 정렬 조회
    List<Comment> findByBoardNoOrderByCreateDateDesc(Integer boardNo);

    // 게시글별 첫 번째 댓글 (오래된 순)
    Optional<Comment> findTopByBoardNoOrderByCreateDateAsc(Integer boardNo);

    // 게시글별 댓글 수 조회
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.boardNo = :boardNo")
    int countByBoardNo(@Param("boardNo") Integer boardNo);

}
