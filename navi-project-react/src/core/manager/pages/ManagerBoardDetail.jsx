import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../css/ManagerBoardDetail.css';

function ManagerBoardDetail() {
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('id');
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (boardId) {
      fetchBoard();
      fetchComments();
    }
  }, [boardId]);

  // 게시글 조회 (관리자 - 조회수 증가 안 함)
  const fetchBoard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken'); // 로그인 시 저장된 JWT 토큰
      const response = await fetch(`/api/adm/board/${boardId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      
      if (!response.ok) throw new Error('조회 실패');
      
      const data = await response.json();
      setBoard(data);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      alert('게시글을 불러올 수 없습니다.');
      navigate('/adm/board');
    } finally {
      setLoading(false);
    }
  };

  // 댓글 조회
  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/board/${boardId}/comments`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setComments(data);
        }
      }
    } catch (error) {
      console.error('댓글 조회 실패:', error);
    }
  }, [boardId]);

  // 게시글 삭제 (관리자)
  const handleDelete = async () => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    if (!window.confirm('삭제된 게시글은 복구할 수 없습니다. 정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/adm/board/${boardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (response.ok) {
        alert('삭제되었습니다.');
        navigate('/adm/board');
      } else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // 댓글 삭제 (관리자)
  const handleDeleteComment = async (commentNo) => {
    if (!window.confirm('이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/adm/board/comment/${commentNo}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      if (response.ok) {
        alert('댓글이 삭제되었습니다.');
        fetchComments();
      } else {
        throw new Error('댓글 삭제 실패');
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

    // 댓글을 계층 구조로 정렬
  const organizeComments = (commentsList) => {
    if (!Array.isArray(commentsList)) {
      return [];
    }

    const organized = [];
    const commentMap = {};

    // 먼저 모든 댓글을 맵에 저장
    commentsList.forEach(comment => {
      commentMap[comment.commentNo] = { ...comment, replies: [] };
    });

    // 부모-자식 관계 설정
    commentsList.forEach(comment => {
      if (comment.parentComment === null || comment.parentComment === undefined) {
        // 최상위 댓글
        organized.push(commentMap[comment.commentNo]);
      } else {
        // 대댓글
        if (commentMap[comment.parentComment]) {
          commentMap[comment.parentComment].replies.push(commentMap[comment.commentNo]);
        }
      }
    });

    return organized;
  };

  // 댓글 렌더링 (계층화)
  const renderComment = (comment, depth = 0) => (
    <div key={comment.commentNo} className={`comment-item depth-${depth}`}>
      <div className="comment-header">
        <span className="comment-author">👤 사용자 {comment.userNo}</span>
        <span className="comment-date">
          {new Date(comment.createDate).toLocaleDateString('ko-KR')} {' '}
          {new Date(comment.createDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
        </span>
        {depth > 0 && <span className="reply-badge">↳ 답글</span>}
      </div>
      
      <div className="comment-content">
        {comment.commentContent}
      </div>

      <div className="comment-actions">
        <button 
          className="btn-delete-comment"
          onClick={() => handleDeleteComment(comment.commentNo)}
        >
          삭제
        </button>
        {comment.reportCount > 0 && (
          <span className="comment-report">🚨 신고 {comment.reportCount}회</span>
        )}
      </div>

      {/* 대댓글 렌더링 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-container">
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="loading-message">로딩 중...</div>;
  }

  if (!board) {
    return <div className="error-message">게시글을 찾을 수 없습니다.</div>;
  }

  // 댓글 계층화
  const organizedComments = organizeComments(comments);
   
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
          <p>번호: {board.boardNo}</p>
          <p>작성자: 사용자 {board.userNo}</p>
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

        {/* 댓글 섹션 */}
        <div className="comments-section">
          <h3 className="comments-title">💬 댓글 ({comments.length})</h3>
          
          {comments.length === 0 ? (
            <div className="no-comments">댓글이 없습니다.</div>
          ) : (
            <div className="comments-list">
              {organizedComments.map(comment => renderComment(comment))}
            </div>
          )}
        </div>
        

        {/* 버튼 영역 */}
        <div className="board-actions manager-actions">
          <button 
            onClick={() => navigate('/adm/board')}
            className="btn-list"
          >
            목록으로
          </button>

          <button 
            onClick={handleDelete}
            className="btn-delete-manager"
          >
            게시글 삭제
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