import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "../css/BoardList.css";

function BoardList() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="loading-message">로딩 중...</div>;
  }

  return (
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
          />
          <button className="btn-search">
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
                  <span>❤️ {board.boardGood}</span>
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
  );
}

export default BoardList;
