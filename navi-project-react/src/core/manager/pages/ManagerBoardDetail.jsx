import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getBoardById, deleteBoard } from './ManagerBoardService';
import '../css/ManagerBoardDetail.css';

function ManagerBoardDetail() {
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('id');
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const data = await getBoardById(boardId);
      setBoard(data);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      alert('게시글을 불러올 수 없습니다.');
      navigate('/manager/board');
    } finally {
      setLoading(false);
    }
  };

  // 게시글 삭제 (관리자 - 이중 확인)
  const handleDelete = async () => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    if (!window.confirm('삭제된 게시글은 복구할 수 없습니다. 정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteBoard(boardId);
      alert('삭제되었습니다.');
      navigate('/manager/board');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="loading-message">로딩 중...</div>;
  }

  if (!board) {
    return <div className="error-message">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="board-detail-container">
      <div className="board-detail-wrapper">
        {/* 관리자 배지 */}
        <div className="manager-badge">
          🛡️ 관리자 모드
        </div>

        {/* 게시글 헤더 */}
        <div className="board-header">
          <h1 className="board-title">{board.boardTitle}</h1>
        </div>

        {/* 게시글 정보 */}
        <div className="board-info">
          <p>번호: {board.userNo}</p>
          <p>작성일: {new Date(board.createDate).toLocaleDateString('ko-KR')} {new Date(board.createDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
          <p>좋아요: {board.boardGood}</p>
          <p>조회수: {board.boardViewCount}</p>
          {board.reportCount > 0 && (
            <p className="report-count">
              🚨 신고 {board.reportCount}회
            </p>
          )}
        </div>

        {/* 게시글 내용 */}
        <div className="board-content">
          <div className="board-content-text">
            {board.boardContent}
          </div>
          
          {/* 이미지 */}
          {board.boardImage && (
            <div className="board-image-container">
              <img 
                src={board.boardImage} 
                alt="게시글 이미지" 
                className="board-image"
              />
            </div>
          )}
        </div>

        {/* 버튼 영역 */}
        <div className="board-actions manager-actions">
          <button 
            onClick={() => navigate('/manager/board')}
            className="btn-list"
          >
            ← 목록으로
          </button>

          <button 
            onClick={handleDelete}
            className="btn-delete-manager"
          >
            🗑️ 게시글 삭제
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="manager-notice">
          <strong>⚠️ 관리자 안내:</strong><br/>
          • 삭제된 게시글은 복구할 수 없습니다.<br/>
          • 신중하게 확인 후 삭제해주세요.<br/>
          • 댓글은 게시글 삭제 시 함께 삭제됩니다.
        </div>
      </div>
    </div>
  );
}

export default ManagerBoardDetail;