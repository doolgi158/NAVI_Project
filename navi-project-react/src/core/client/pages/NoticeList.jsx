import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getNotices, searchNotices } from "./NoticeService";
import "../css/NoticeList.css";
import "../../../css/common/Pagination.css";
import Pagination from "@/common/components/Pagination";

function NoticeList() {
  const [notices, setNotices] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();

  console.log('🎯 NoticeList 컴포넌트 렌더링됨!');

  useEffect(() => {
    console.log('✅ useEffect 실행! currentPage:', currentPage);
    fetchNotices();
  }, [currentPage]);

  const fetchNotices = async () => {
    console.log('🔍 fetchNotices 호출됨! currentPage:', currentPage);
    try {
      setLoading(true);
      console.log('📞 getNotices API 호출 시작...');
      const data = await getNotices(currentPage, pageSize);
      console.log('📦 getNotices 응답 데이터:', data);

      if (data && Array.isArray(data.notices)) {
        console.log('✅ notices 배열 확인:', data.notices.length, '개');
        setNotices(data.notices);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        console.log('✅ data가 배열:', data.length, '개');
        setNotices(data);
        setTotalPages(1);
      } else {
        console.warn('⚠️ 예상과 다른 데이터 구조:', data);
        setNotices([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("❌ 공지사항 목록 불러오기 실패:", error);
      setNotices([]);
    } finally {
      setLoading(false);
      console.log('✅ fetchNotices 완료!');
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
    const safeTotal = totalPages > 0 ? totalPages : 1;
    if (page >= 0 && page < safeTotal) setCurrentPage(page);
  };

  console.log('📊 현재 상태 - loading:', loading, 'notices:', notices.length);

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