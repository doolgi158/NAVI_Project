package com.navi.notice.repository;

import com.navi.notice.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Integer> {

    // 최신순으로 공지사항 목록 조회
    List<Notice> findAllByOrderByCreateDateDesc();

    // 조회수 증가
    @Modifying
    @Query("UPDATE Notice n SET n.noticeViewCount = n.noticeViewCount + 1 WHERE n.noticeNo = :noticeNo")
    void incrementViewCount(@Param("noticeNo") Integer noticeNo);

    // 제목으로 검색
    List<Notice> findByNoticeTitleContainingOrderByCreateDateDesc(String keyword);
}