package com.navi.board.repository;

import com.navi.board.domain.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Integer> {
    // 제목 또는 내용에 키워드가 포함된 게시글 검색
    @Query("SELECT b FROM Board b WHERE b.boardTitle LIKE %:keyword% OR b.boardContent LIKE %:keyword% ORDER BY b.createDate DESC")
    List<Board> searchByKeyword(@Param("keyword") String keyword);
}