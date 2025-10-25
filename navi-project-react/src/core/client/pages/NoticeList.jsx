import React, { useState, useEffect } from 'react';
import { getAllNotices, searchNotice } from './NoticeService';
import { Link, useNavigate } from 'react-router-dom';
import "../css/NoticeList.css";
import MainLayout from '@/users/layout/MainLayout';

function NoticeList() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 페이징 State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // currentPage 변경 시 공지사항 조회
  useEffect(() => {
    fetchNotice();
  }, [currentPage]);

  // 공지사항 조회 (페이징)
  const fetchNotice = async () => {
    try {
      setLoading(true);
      const data = await getAllNotices(currentPage, pageSize);
      setNotices(data.notices || []);
      setCurrentPage(data.currentPage || 0);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error('공지사항을 불러오는데 실패했습니다:', error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 (페이징)
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setCurrentPage(0);
      fetchNotice();
      return;
    }

    try {
      const data = await searchNotice(searchKeyword, currentPage, pageSize);
      setNotices(data.notices || []);
      setCurrentPage(data.currentPage || 0);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error('검색에 실패했습니다:', error);
      setNotices([]);
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxButtons = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(0, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  // 날짜 포맷 변환
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading">로딩 중...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="notice-list-container">
        {/* 헤더 - 게시판/공지사항 선택 */}
        <div className="notice-header">
          <div className="board-nav">
            <Link to="/board" className="nav-link">일반 게시판</Link>
            <span className="nav-divider">|</span>
            <Link to="/notice" className="nav-link active">공지사항</Link>
          </div>
        </div>

        {/* 검색 영역 */}
        <div className="search-box">
          <input
            type="text"
            placeholder="제목으로 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                setCurrentPage(0);
                handleSearch();
              }
            }}
          />
          <button onClick={() => {
            setCurrentPage(0);
            handleSearch();
          }}>검색</button>
          <button onClick={() => {
            setSearchKeyword('');
            setCurrentPage(0);
            fetchNotice();
          }}>전체보기</button>
        </div>

        {/* 공지사항 테이블 */}
        {notices.length === 0 ? (
          <div className="no-notices">공지사항이 없습니다.</div>
        ) : (
          <>
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
                {notices.map((notice) => (
                  <tr
                    key={notice.noticeNo}
                    onClick={() => navigate(`/notice/detail?noticeNo=${notice.noticeNo}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{notice.noticeNo}</td>
                    <td className="title-cell">{notice.noticeTitle}</td>
                    <td>{formatDate(notice.createDate)}</td>
                    <td>{notice.noticeViewCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 페이지네이션 */}
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
                className="page-btn"
              >
                &laquo; 처음
              </button>
              
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="page-btn"
              >
                &lsaquo; 이전
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum + 1}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="page-btn"
              >
                다음 &rsaquo;
              </button>

              <button 
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="page-btn"
              >
                마지막 &raquo;
              </button>
            </div>

            <div className="pagination-info">
              총 {totalItems}개 | {currentPage + 1} / {totalPages} 페이지
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default NoticeList;