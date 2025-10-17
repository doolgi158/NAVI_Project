import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/BoardList.css';
import "../css/BoardList.css";
import MainLayout from '@/users/layout/MainLayout';

function BoardList() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/board')
      .then(response => response.json())
      .then(data => {
        setBoards(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('에러:', error);
        setLoading(false);
      });
  }, []);

  // 검색 함수
  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      // 검색어가 없으면 전체 목록
      fetch('http://localhost:8080/api/board')
        .then(response => response.json())
        .then(data => setBoards(data))
        .catch(error => console.error('에러:', error));
      return;
    }

    // 검색 API 호출
    fetch(`http://localhost:8080/api/board/search?keyword=${encodeURIComponent(searchKeyword)}`)
      .then(response => response.json())
      .then(data => setBoards(data))
      .catch(error => console.error('검색 에러:', error));
  };

  // 엔터키로 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return <div className="loading-message">로딩 중...</div>;
  }

  return (
    <MainLayout>
    <div className="board-list-container">
      <div className="board-list-wrapper">
        {/* 헤더 */}
        <div className="board-list-header">
          <div className="board-list-title">일반 게시판</div>
          <Link to="/board/write" className="btn-write">
            ✏️ 글쓰기
          </Link>
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
          <button className="btn-search" onClick={handleSearch}>
            🔍 검색
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
                <div className="board-item-title">
                  {board.boardTitle}
                </div>
                <div className="board-item-meta">
                  <span>
                    {new Date(board.createDate).toLocaleDateString('ko-KR')} {new Date(board.createDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
                  </span>
                  <span>사용자 {board.userNo}</span>
                  <span>❤️{board.boardGood}</span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="board-footer">
          <div className="pagination">
            <button className="page-btn">
              ◀ 이전
            </button>
            <input
              type="text"
              value="1"
              readOnly
              className="page-input"
            />
            <button className="page-btn">
              다음 ▶
            </button>
          </div>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}

export default BoardList;
