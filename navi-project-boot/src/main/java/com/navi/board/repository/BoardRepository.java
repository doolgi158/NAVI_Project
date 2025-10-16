package com.navi.board.repository;

import com.navi.board.domain.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BoardRepository extends JpaRepository<Board, Integer> {
    // 일단 비워두기 (검색 기능은 나중에 추가)
}