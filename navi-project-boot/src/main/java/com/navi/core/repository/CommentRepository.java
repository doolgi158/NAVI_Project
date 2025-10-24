package com.navi.core.repository;

import com.navi.core.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {

    List<Comment> findByBoardNoOrderByCreateDateDesc(Integer boardNo);

    int countByBoardNo(Integer boardNo);

    @Query("SELECT c FROM Comment c WHERE c.boardNo = :boardNo ORDER BY c.createDate DESC")
    List<Comment> findByBoardNo(@Param("boardNo") Integer boardNo);
}