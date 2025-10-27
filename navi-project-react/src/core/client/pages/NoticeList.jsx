import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getNotices, searchNotices } from "./NoticeService";
import "../css/NoticeList.css";
import "../../../css/common/Pagination.css"; // ✅ 공통 페이지네이션 CSS 유지
import Pagination from "@/common/components/Pagination";

function NoticeList() {
  const [notices, setNotices] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotices();
  }, [currentPage]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await getNotices(currentPage, pageSize);

      if (data && Array.isArray(data.notices)) {
        setNotices(data.notices);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setNotices(data);
        setTotalPages(1);
      } else {
        setNotices([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("공지사항 목록 불러오기 실패:", error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setCurrentPage(0);
      fetchNotices();
      return;
    }

    try {
      const data = await searchNotices(searchKeyword, currentPage, pageSize);
      if (data && Array.isArray(data.notices)) {
        setNotices(data.notices);
        setTotalPages(data.totalPages || 1);
      } else {
        setNotices([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("검색 실패:", error);
      setNotices([]);
    }
  };

  const handlePageChange = (page) => {
    const safeTotal = totalPages > 0 ? totalPages : 1; // 최소 1 보장
    if (page >= 0 && page < safeTotal) setCurrentPage(page);
  };

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div className="notice-list-container">
      <div className="board-list-header">
        <div className="board-nav">
          <Link to="/board" className="nav-link">일반 게시판</Link>
          <span className="nav-divider">|</span>
          <Link to="/notice" className="nav-link active">공지사항</Link>
        </div>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="공지 제목으로 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch}>검색</button>
      </div>

      <table className="notice-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성일</th>
            <th>조회수</th>
          </tr>
        </thead>
        <tbody>
          {notices.length === 0 ? (
            <tr>
              <td colSpan="4">공지사항이 없습니다.</td>
            </tr>
          ) : (
            notices.map((notice) => (
              <tr key={notice.noticeNo}>
                <td>{notice.noticeNo}</td>
                <td
                  className="notice-title"
                  onClick={() =>
                    navigate(`/notice/detail?noticeNo=${notice.noticeNo}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  {notice.noticeTitle}
                </td>
                <td>
                  {new Date(notice.createDate).toLocaleDateString("ko-KR")}
                </td>
                <td>{notice.noticeViewCount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default NoticeList;
