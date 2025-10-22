import React, { useState, useEffect } from 'react';
import { getAllNotices, searchNotice } from './NoticeService';
import { Link, useNavigate } from 'react-router-dom';
import "../css/NoticeList.css";
import MainLayout from '@/users/layout/MainLayout';

function NoticeList() {
  const [notices, setNotices] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 컴포넌트가 처음 로드될 때 공지사항 목록 가져오기
  useEffect(() => {
    fetchNotice();
  }, []);

  // 공지사항 목록 가져오기
  const fetchNotice = async () => {
    try {
      setLoading(true);
      const data = await getAllNotices();
      setNotices(data);
    } catch (error) {
      console.error('공지사항 목록을 불러오는데 실패했습니다:', error);
      alert('공지사항 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

// 검색
const handleSearch = async () => {
  if (!searchKeyword.trim()) {
    fetchNotice();
    return;
  }

  try {
    const data = await searchNotice(searchKeyword);
    console.log('검색 결과:', data); // ← 추가!
    
    if (Array.isArray(data)) {
      setNotices(data);
    } else if (data && Array.isArray(data.notices)) {
      setNotices(data.notices);
    } else {
      setNotices([]);
    }
  } catch (error) {
    console.error('검색에 실패했습니다:', error);
    alert('검색에 실패했습니다.');
    setNotices([]);
  }
};

  // 날짜 포맷 변환
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <MainLayout>
    <div className="notice-list-container">
      {/* 헤더 - 게시판/공지사항 선택 */}
      <div className="notice-header">
        <div className="board-nav">
          <Link to="/client/board" className="nav-link">일반 게시판</Link>
          <span className="nav-divider">|</span>
          <Link to="/client/notice" className="nav-link active">공지사항</Link>
        </div>
      </div>

      {/* 검색 영역 */}
      <div className="search-box">
        <input
          type="text"
          placeholder="제목으로 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>검색</button>
        <button onClick={fetchNotice}>전체보기</button>
      </div>

      {/* 공지사항 테이블 */}
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
                  onClick={() => navigate(`/client/notice/detail?noticeNo=${notice.noticeNo}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {notice.noticeTitle}
                </td>
                <td>{formatDate(notice.createDate)}</td>
                <td>{notice.noticeViewCount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    </MainLayout>
  );
}

export default NoticeList;