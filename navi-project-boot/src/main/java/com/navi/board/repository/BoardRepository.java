package com.navi.board.repository;

import com.navi.board.domain.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Integer> {   //<엔티티클래스, ID타입> 자동구현

    // 제목으로 검색
    @Query("SELECT b FROM Board b WHERE b.board_Title LIKE %:keyword%")
    List<Board> searchByTitle(@Param("keyword") String keyword);

    // 내용으로 검색
    @Query("SELECT b FROM Board b WHERE b.board_content LIKE %:keyword%")
    List<Board> searchByContent(@Param("keyword") String keyword);
}