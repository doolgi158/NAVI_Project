package com.navi.board.repository;

import com.navi.board.domain.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {   //<엔티티클래스, ID타입> 자동구현

    // 제목으로 검색
    //List<Board> board_Title(String keyword);

    // 내용으로 검색
    //List<Board> board_content(String keyword);
}