package com.navi.core.repository;

import com.navi.core.domain.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    Page<Notice> findByNoticeTitleContainingOrNoticeContentContaining(
            String title, String content, Pageable pageable
    );

    // 조회수 증가
    @Modifying
    @Query("UPDATE Notice n SET n.noticeViewCount = n.noticeViewCount + 1 WHERE n.noticeNo = :noticeNo")
    void incrementViewCount(@Param("noticeNo") Integer noticeNo);

    // 제목으로 검색
    @Query("SELECT n FROM Notice n WHERE n.noticeTitle LIKE %:keyword% OR n.noticeContent LIKE %:keyword% ORDER BY n.createDate DESC")
    List<Notice> searchByKeyword(@Param("keyword") String keyword);

    // 또는
    List<Notice> findByNoticeTitleContainingOrNoticeContentContainingOrderByCreateDateDesc(
            String titleKeyword, String contentKeyword
    );
}