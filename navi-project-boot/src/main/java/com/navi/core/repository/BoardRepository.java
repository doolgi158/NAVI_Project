package com.navi.core.repository;

import com.navi.core.domain.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Integer> {

    // 전체 게시글 조회 (최신순)
    List<Board> findAllByOrderByCreateDateDesc();

    // 제목 또는 내용에 키워드가 포함된 게시글 검색 (최신순)
    @Query("SELECT b FROM Board b WHERE b.boardTitle LIKE %:keyword% OR b.boardContent LIKE %:keyword% ORDER BY b.createDate DESC")
    List<Board> searchByKeyword(@Param("keyword") String keyword);

    // 검색 (페이징)
    Page<Board> findByBoardTitleContainingOrBoardContentContaining(
            String title, String content, Pageable pageable
    );
}