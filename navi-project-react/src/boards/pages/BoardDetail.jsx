import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import "../css/BoardDetail.css";

function BoardDetail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  
  
  const [board, setBoard] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // 게시글 조회
    fetch(`http://localhost:8080/api/board/${id}`)
      .then(response => response.json())
      .then(data => {
        setBoard(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('에러:', error);
        setLoading(false);
      });

    // 댓글 조회
    fetch(`http://localhost:8080/api/board/${id}/comments`)
      .then(response => response.json())
      .then(data => {
        setComments(data);
        setCommentCount(data.length);
      })
      .catch(error => console.error('댓글 로드 에러:', error));
  }, [id]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      alert('댓글을 입력해주세요.');
      return;
    }

    fetch(`http://localhost:8080/api/board/${id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment })
    })
      .then(() => {
        setNewComment('');
        // 댓글 목록 다시 불러오기
        return fetch(`http://localhost:8080/api/board/${id}/comments`);
      })
      .then(response => response.json())
      .then(data => {
        setComments(data);
        setCommentCount(data.length);
      })
      .catch(error => console.error('댓글 작성 에러:', error));
  };

// 좋아요 토글 기능
const handleLike = () => {
  if (isLiked) {
    // 좋아요 취소
    fetch(`http://localhost:8080/api/board/${id}/unlike`, {
      method: 'POST'
    })
      .then(response => response.text())
      .then(result => {
        if (result === 'success') {
          setIsLiked(false);
          return fetch(`http://localhost:8080/api/board/${id}`);
        }
      })
      .then(response => response.json())
      .then(data => {
        setBoard(data);
      })
      .catch(error => console.error('좋아요 취소 에러:', error));
  } else {
    // 좋아요
    fetch(`http://localhost:8080/api/board/${id}/like`, {
      method: 'POST'
    })
      .then(response => response.text())
      .then(result => {
        if (result === 'success') {
          setIsLiked(true);
          return fetch(`http://localhost:8080/api/board/${id}`);
        }
      })
      .then(response => response.json())
      .then(data => {
        setBoard(data);
      })
      .catch(error => console.error('좋아요 에러:', error));
  }
};

  //신고
  const handleReport = () => {
    if (window.confirm('이 게시글을 신고하시겠습니까?')) {
      fetch(`http://localhost:8080/api/board/${id}/report`, {
        method: 'POST'
      })
        .then(response => response.text())
        .then(result => {
          if (result === 'success') {
            alert('신고가 접수되었습니다.');
            window.location.reload();
          }
        })
        .catch(error => console.error('신고 에러:', error));
    }
  };

  if (loading) {
    return <div className="loading-message">로딩 중...</div>;
  }

  if (!id || !board) {
    return <div className="error-message">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="board-detail-container">
      <div className="board-detail-wrapper">
        {/* 게시글 헤더 */}
        <div className="board-header">
          <h2 className="board-title">{board.boardTitle}</h2>
          <div className="board-info">
            <p> 번호: {board.boardNo}</p>
            <p> 작성일: {new Date(board.createDate).toLocaleDateString('ko-KR')} {new Date(board.createDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
            <p> 작성자: {board.userNo}</p>
            <p>❤️ 좋아요: {board.boardGood}</p>
            <p>🚨 신고: {board.reportCount}</p>
          </div>
        </div>

        {/* 게시글 내용 */}
        <div className="board-content">
          <p className="board-content-text">{board.boardContent}</p>
        </div>

        {/* 버튼 */}
        <div className="board-actions">
          <Link to="/board" className="btn-list">
            목록으로
          </Link>
          
          <div className="action-buttons">
            {/* 좋아요 버튼 */}
            <button 
              onClick={handleLike} 
              className={`btn-like ${isLiked ? 'liked' : ''}`}
            >
              {isLiked ? '❤️' : '🤍'} 좋아요 ({board.boardGood})
            </button>
            
            <button onClick={handleReport} className="btn-report">
              🚨 신고하기
            </button>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="comment-section">
          <h3 className="comment-header-title"> 댓글 {commentCount}개</h3>

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요 (최대 500자)"
              maxLength="500"
              className="comment-textarea"
            />
            <button type="submit" className="btn-comment-submit">
              댓글 작성
            </button>
          </form>

          {/* 댓글 목록 */}
          <div className="comment-list">
            {comments.length === 0 ? (
              <div className="no-comments">
                💭 아직 댓글이 없습니다.<br />
                첫 댓글을 작성해보세요!
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.commentNo} className="comment-item">
                  <div className="comment-item-header">
                    <span className="comment-author">
                      👤 사용자 {comment.userNo}
                    </span>
                    <span className="comment-date">
                      {new Date(comment.createDate).toLocaleDateString('ko-KR')} {new Date(comment.createDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </div>
                  <div className="comment-content">
                    {comment.commentContent}
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('댓글을 삭제하시겠습니까?')) {
                        fetch(`http://localhost:8080/api/board/comment/${comment.commentNo}`, {
                          method: 'DELETE'
                        })
                          .then(() => {
                            return fetch(`http://localhost:8080/api/board/${id}/comments`);
                          })
                          .then(response => response.json())
                          .then(data => {
                            setComments(data);
                            setCommentCount(data.length);
                          })
                          .catch(error => console.error('댓글 삭제 에러:', error));
                      }
                    }}
                    className="btn-comment-delete"
                  >
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardDetail;
