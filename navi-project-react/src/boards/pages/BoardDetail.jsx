import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import "../css/BoardDetail.css";

function BoardDetail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  
  const [board, setBoard] = useState(null);
  const [comments, setComments] = useState([]); //댓글목록
  const [commentCount, setCommentCount] = useState(0); //댓글수
  const [newComment, setNewComment] = useState(''); //댓글작성
  const [loading, setLoading] = useState(true); //로딩
  const [isLiked, setIsLiked] = useState(false); //좋아요
  const [showMenu, setShowMenu] = useState(false); // 메뉴표시
  const [isEditing, setIsEditing] = useState(false); // 수정
  const [editTitle, setEditTitle] = useState(''); //제목
  const [editContent, setEditContent] = useState(''); //내용

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchBoard();
    fetchComments();
  }, [id]);

  const fetchBoard = () => {
    fetch(`http://localhost:5173/api/board/${id}`)
      .then(response => response.json())
      .then(data => {
        setBoard(data);
        setEditTitle(data.boardTitle);
        setEditContent(data.boardContent);
        setLoading(false);
      })
      .catch(error => {
        console.error('에러:', error);
        setLoading(false);
      });
  };

  const fetchComments = () => {
    fetch(`http://localhost:5173/api/board/${id}/comments`)
      .then(response => response.json())
      .then(data => {
        setComments(data);
        setCommentCount(data.length);
      })
      .catch(error => console.error('댓글 로드 에러:', error));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      alert('댓글을 입력해주세요.');
      return;
    }

    fetch(`http://localhost:5173/api/board/${id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment })
    })
      .then(() => {
        setNewComment('');
        fetchComments();
      })
      .catch(error => console.error('댓글 작성 에러:', error));
  };

  const handleLike = () => {
    const endpoint = isLiked ? 'unlike' : 'like';
    fetch(`http://localhost:5713/api/board/${id}/${endpoint}`, {
      method: 'POST'
    })
      .then(response => response.text())
      .then(result => {
        if (result === 'success') {
          setIsLiked(!isLiked);
          fetchBoard();
        }
      })
      .catch(error => console.error('좋아요 에러:', error));
  };

  const handleReport = () => {
    if (window.confirm('이 게시글을 신고하시겠습니까?')) {
      fetch(`http://localhost:5173/api/board/${id}/report`, {
        method: 'POST'
      })
        .then(response => response.text())
        .then(result => {
          if (result === 'success') {
            alert('신고가 접수되었습니다.');
            setShowMenu(false);
          }
        })
        .catch(error => console.error('신고 에러:', error));
    }
  };

  // 수정 모드
  const handleEditMode = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(board.boardTitle);
    setEditContent(board.boardContent);
  };

  // 수정 저장
  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    fetch(`http://localhost:5173/api/board/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: editTitle, 
        content: editContent 
      })
    })
      .then(response => response.text())
      .then(result => {
        if (result === 'success') {
          alert('수정되었습니다.');
          setIsEditing(false);
          fetchBoard();
        }
      })
      .catch(error => {
        console.error('수정 에러:', error);
        alert('수정에 실패했습니다.');
      });
  };

  // 삭제
  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      fetch(`http://localhost:5173/api/board/${id}`, {
        method: 'DELETE'
      })
        .then(response => response.text())
        .then(result => {
          if (result === 'success') {
            alert('삭제되었습니다.');
            navigate('/board');
          }
        })
        .catch(error => {
          console.error('삭제 에러:', error);
          alert('삭제에 실패했습니다.');
        });
    }
  };

  // 공유하기
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('링크가 복사되었습니다!');
      setShowMenu(false);
    });
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
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="edit-title-input"
              placeholder="제목을 입력하세요"
            />
          ) : (
            <h2 className="board-title">{board.boardTitle}</h2>
          )}
          
          {/* 더보기 메뉴 버튼 */}
          <div className="menu-container">
            <button 
              className="menu-button"
              onClick={() => setShowMenu(!showMenu)}
            >
              ⋯
            </button>
            
            {showMenu && (
              <div className="dropdown-menu">
                <button onClick={handleEditMode}>수정</button>
                <button onClick={handleDelete}>삭제</button>
                <button onClick={handleReport}>신고</button>
                <button onClick={handleShare}>🔗 공유</button>
              </div>
            )}
          </div>
        </div>

        <div className="board-info">
          <p>번호: {board.boardNo}</p>
          <p>작성일: {new Date(board.createDate).toLocaleDateString('ko-KR')} {new Date(board.createDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
          <p>작성자: {board.userNo}</p>
          <p>조회수: {board.boardViewCount || 0}</p>
        </div>

        {/* 게시글 내용 */}
        <div className="board-content">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="edit-content-textarea"
              placeholder="내용을 입력하세요"
            />
          ) : (
            <p className="board-content-text">{board.boardContent}</p>
          )}
        </div>

        {/* 버튼 */}
        <div className="board-actions">
          {isEditing ? (
            <div className="edit-buttons">
              <button onClick={handleCancelEdit} className="btn-cancel">취소</button>
              <button onClick={handleSaveEdit} className="btn-save">저장</button>
            </div>
          ) : (
            <>
              <Link to="/board" className="btn-list">
                목록으로
              </Link>
              
              <button 
                onClick={handleLike} 
                className={`btn-like ${isLiked ? 'liked' : ''}`}
              >
                {isLiked ? '❤️' : '🤍'} 좋아요 ({board.boardGood})
              </button>
            </>
          )}
        </div>

        {/* 댓글 섹션 */}
        <div className="comment-section">
          <h3 className="comment-header-title">💬 댓글 {commentCount}개</h3>

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
                        fetch(`http://localhost:5173/api/board/comment/${comment.commentNo}`, {
                          method: 'DELETE'
                        })
                          .then(() => fetchComments())
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