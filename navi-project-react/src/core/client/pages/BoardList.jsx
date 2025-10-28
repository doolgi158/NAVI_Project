import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllBoards, searchBoards } from './Boardservice';
import '../css/BoardList.css';
import MainLayout from '@/users/layout/MainLayout';

function BoardList() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 페이징 State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return '날짜 없음';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '날짜 없음';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}.${month}.${day} ${hour}:${minute}`;
    } catch {
      return '날짜 없음';
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [currentPage]);

  // 게시판 조회 (페이징)
  const fetchBoards = async () => {
    try {
      setLoading(true);
      const data = await getAllBoards(currentPage, pageSize);
      console.log('📦 서버 응답:', data);
      setBoards(data.boards || data.content || []);
      setCurrentPage(data.currentPage || 0);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error('에러:', error);
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 (페이징)
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setCurrentPage(0);
      fetchBoards();
      return;
    }

    try {
      const data = await searchBoards(searchKeyword, currentPage, pageSize);
      setBoards(data.boards || []);
      setCurrentPage(data.currentPage || 0);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error('검색 에러:', error);
      setBoards([]);
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

  // 엔터키로 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(0);
      handleSearch();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-message">로딩 중...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="board-list-container">
        <div className="board-list-wrapper">
          {/* 헤더 */}
          <div className="board-list-header">
            <div className="board-nav">
              <Link to="/board" className="nav-link active">일반 게시판</Link>
              <span className="nav-divider">|</span>
              <Link to="/notice" className="nav-link">공지사항</Link>
            </div>
          </div>

          {/* 검색 박스 */}
          <div className="search-box">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="btn-search" onClick={() => {
              setCurrentPage(0);
              handleSearch();
            }}>
              검색
            </button>
            <button className="btn-search" onClick={() => {
              setSearchKeyword('');
              setCurrentPage(0);
              fetchBoards();
            }}>
              전체보기
            </button>
          </div>

          {/* 게시글 목록 */}
          <div className="board-list">
            {boards.length === 0 ? (
              <div className="empty-message">
                등록된 게시글이 없습니다.<br />
                첫 게시글을 작성해보세요!
              </div>
            ) : (
              boards.map(board => (
                <Link
                  key={board.boardNo}
                  to={`/board/detail?id=${board.boardNo}`}
                  className="board-item"
                >
                  <div className="board-item-header">
                    <div className="board-item-title">
                      {board.boardTitle}
                    </div>
                    <div className="board-item-stats">
                      <span className="stat-item">
                        <span className="stat-icon">❤️</span>
                        <span className="stat-value">{board.boardGood || 0}</span>
                      </span>
                      <span className="stat-item">
                        <span className="stat-icon">조회수</span>
                        <span className="stat-value">{board.boardViewCount || 0}</span>
                      </span>
                      <span className="stat-item">
                        <span className="stat-icon">댓글</span>
                        <span className="stat-value">{board.commentCount || 0}</span>
                      </span>
                    </div>
                  </div>
                  <div className="board-item-meta">
                    <span className="meta-author">👤 사용자 {board.userNo}</span>
                    <span className="meta-date">🕐 {formatDate(board.createDate)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {boards.length > 0 && totalPages > 0 && (
            <div className="pagination-wrapper">
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
            </div>
          )}

          {/* 글쓰기 버튼 */}
          <div className="board-footer">
            <Link to="/board/write" className="btn-write">
              글쓰기
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default BoardList;