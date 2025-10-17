// src/components/NoticeList.js
import React, { useState, useEffect } from 'react';
import { getAllNotices, deleteNotice, searchNotices } from '../services/noticeService';
import { useNavigate } from 'react-router-dom';
import './NoticeList.css';

function NoticeList() {
  const [notices, setNotices] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 컴포넌트가 처음 로드될 때 공지사항 목록 가져오기
  useEffect(() => {
    fetchNotices();
  }, []);

  // 공지사항 목록 가져오기
  const fetchNotices = async () => {
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
      fetchNotices();
      return;
    }

    try {
      const data = await searchNotices(searchKeyword);
      setNotices(data);
    } catch (error) {
      console.error('검색에 실패했습니다:', error);
      alert('검색에 실패했습니다.');
    }
  };

  // 삭제
  const handleDelete = async (noticeNo) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteNotice(noticeNo);
      alert('삭제되었습니다.');
      fetchNotices(); // 목록 새로고침
    } catch (error) {
      console.error('삭제에 실패했습니다:', error);
      alert('삭제에 실패했습니다.');
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
    <div className="notice-list-container">
      <h1>공지사항</h1>

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
        <button onClick={fetchNotices}>전체보기</button>
      </div>

      {/* 작성 버튼 */}
      <div className="button-area">
        <button 
          className="create-button"
          onClick={() => navigate('/notices/create')}
        >
          공지사항 작성
        </button>
      </div>

      {/* 공지사항 테이블 */}
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
            <tr>
              <td colSpan="5">공지사항이 없습니다.</td>
            </tr>
          ) : (
            notices.map((notice) => (
              <tr key={notice.noticeNo}>
                <td>{notice.noticeNo}</td>
                <td 
                  className="notice-title"
                  onClick={() => navigate(`/notices/${notice.noticeNo}`)}
                >
                  {notice.noticeTitle}
                </td>
                <td>{formatDate(notice.createDate)}</td>
                <td>{notice.noticeViewCount}</td>
                <td>
                  <button 
                    className="edit-button"
                    onClick={() => navigate(`/notices/edit/${notice.noticeNo}`)}
                  >
                    수정
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(notice.noticeNo)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default NoticeList;