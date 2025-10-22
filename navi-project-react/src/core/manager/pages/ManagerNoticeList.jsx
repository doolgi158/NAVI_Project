import React, { useState, useEffect } from 'react';
import { getAllNotices, deleteNotice, searchNotice } from "./ManagerNoticeService";
import { useNavigate } from 'react-router-dom';
import "../css/NoticeList.css";

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
    
    // ✅ 배열인지 확인 후 설정
    console.log('API 응답:', data); // 디버깅용
    
    if (Array.isArray(data)) {
      setNotices(data);
    } else if (data && Array.isArray(data.notices)) {
      setNotices(data.notices); // 객체 안에 배열이 있는 경우
    } else {
      setNotices([]); // 배열이 아니면 빈 배열
    }
  } catch (error) {
    console.error('공지사항 목록을 불러오는데 실패했습니다:', error);
    alert('공지사항 목록을 불러오는데 실패했습니다.');
    setNotices([]); // ← 에러 시에도 빈 배열
  } finally {
    setLoading(false);
  }
};

// 검색도 동일하게
const handleSearch = async () => {
  if (!searchKeyword.trim()) {
    fetchNotice();
    return;
  }

  try {
    const data = await searchNotice(searchKeyword);
    
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
    setNotices([]); // ← 에러 시에도 빈 배열
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
      fetchNotice(); // 목록 새로고침
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
        <button onClick={fetchNotice}>전체보기</button>
      </div>

      {/* 작성 버튼 */}
      <div className="button-area">
        <button 
          className="create-button"
          onClick={() => navigate('/manager/notice/write')}
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
                  onClick={() => navigate(`/manager/notice/detail?noticeNo=${notice.noticeNo}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {notice.noticeTitle}
                </td>
                <td>{formatDate(notice.createDate)}</td>
                <td>{notice.noticeViewCount}</td>
                <td>
                  <button 
                    className="edit-button"
                    onClick={() => navigate(`/manager/notice/write?noticeNo=${notice.noticeNo}`)}
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