package com.navi.core.repository;

import com.navi.core.domain.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 공지사항 Repository
 * - 기본 CRUD
 * - 페이징, 검색, 조회수 증가 기능 포함
 */
@Repository
public interface NoticeRepository extends JpaRepository<Notice, Integer> {

    /** 제목 또는 내용 검색 (대소문자 무시) */
    Page<Notice> findByNoticeTitleContainingIgnoreCaseOrNoticeContentContainingIgnoreCase(
            String titleKeyword,
            String contentKeyword,
            Pageable pageable
    );

    /** 게시 기간 내 공지사항 조회 */
    Page<Notice> findByNoticeStartDateBeforeAndNoticeEndDateAfter(
            java.time.LocalDateTime startDate,
            java.time.LocalDateTime endDate,
            Pageable pageable
    );

    /** 조회수 증가 */
    @Modifying
    @Query("UPDATE Notice n SET n.noticeViewCount = n.noticeViewCount + 1 WHERE n.noticeNo = :noticeNo")
    void incrementViewCount(@Param("noticeNo") Integer noticeNo);
}
