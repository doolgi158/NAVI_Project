import React, { useState, useEffect } from 'react';
import { getAllNotices, deleteNotice, searchNotice } from "./ManagerNoticeService";
import { useNavigate, Link } from 'react-router-dom';
import '../css/ManagerNoticeList.css';
import '../../../css/common/Pagination.css'; // ✅ 공통 페이지네이션 스타일
import Pagination from "@/common/components/Pagination";

function ManagerNoticeList() {
  const [notices, setNotices] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
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
      const data = await getAllNotices(currentPage, pageSize);

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
      console.error('공지사항 목록 조회 실패:', error);
      alert('공지사항 목록을 불러오는데 실패했습니다.');
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
      const data = await searchNotice(searchKeyword, currentPage, pageSize);
      if (data && Array.isArray(data.notices)) {
        setNotices(data.notices);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setNotices(data);
        setTotalPages(1);
      } else {
        setNotices([]);
      }
    } catch (error) {
      console.error('검색 실패:', error);
      alert('검색에 실패했습니다.');
      setNotices([]);
    }
  };

  const handleDelete = async (noticeNo) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteNotice(noticeNo);
      alert('삭제되었습니다.');
      fetchNotices();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
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
          <Link to="/adm/board" className="nav-link">일반 게시판</Link>
          <span className="nav-divider">|</span>
          <Link to="/adm/notice" className="nav-link active">공지사항</Link>
        </div>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="제목으로 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>검색</button>
        <button onClick={() => { setSearchKeyword(''); setCurrentPage(0); fetchNotices(); }}>전체보기</button>
      </div>

      <div className="button-area">
        <button className="create-button" onClick={() => navigate('/adm/notice/write')}>
          공지사항 작성
        </button>
      </div>

      <table className="notice-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성일</th>
            <th>조회수</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {notices.length === 0 ? (
            <tr><td colSpan="5">공지사항이 없습니다.</td></tr>
          ) : (
            notices.map((notice) => (
              <tr key={notice.noticeNo}>
                <td>{notice.noticeNo}</td>
                <td
                  className="notice-title"
                  onClick={() => navigate(`/adm/notice/detail?noticeNo=${notice.noticeNo}`)}
                >
                  {notice.noticeTitle}
                </td>
                <td>{formatDate(notice.createDate)}</td>
                <td>{notice.noticeViewCount}</td>
                <td>
                  <button className="edit-button" onClick={() => navigate(`/adm/notice/write?noticeNo=${notice.noticeNo}`)}>
                    수정
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(notice.noticeNo)}>
                    삭제
                  </button>
                </td>
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

export default ManagerNoticeList;