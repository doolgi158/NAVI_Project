import { useEffect, useState, useCallback } from 'react';
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
  const [replyTo, setReplyTo] = useState(null); // 답글 달 댓글 번호
  const [replyContent, setReplyContent] = useState('');
  
  const fetchBoard = useCallback(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    fetch(`/api/board/${id}`)
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
  }, [id]);

  const fetchComments = useCallback(() => {
    if (!id) {
      return;
    }
    fetch(`/api/board/${id}/comments`)
      .then(response => response.json())
      .then(data => {
        setComments(data);
        setCommentCount(data.length);
      })
      .catch(error => console.error('댓글 로드 에러:', error));
  }, [id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchBoard();
    fetchComments();
  }, [id, fetchBoard, fetchComments]);

  // 일반 댓글 작성
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert('댓글을 입력해주세요.');
      return;
    }

    fetch(`/api/board/${id}/comments`, {
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

  // 대댓글 작성
  const handleReplySubmit = (parentCommentNo) => {
    if (!replyContent.trim()) {
      alert('답글을 입력해주세요.');
      return;
    }

    fetch(`/api/board/${id}/comment/${parentCommentNo}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyContent })
    })
      .then(() => {
        setReplyContent('');
        setReplyTo(null);
        fetchComments();
      })
      .catch(error => console.error('답글 작성 에러:', error));
  };

  // 댓글 신고
  const handleReportComment = (commentNo) => {
    // 이미 신고했는지 체크
    const reportedComments = JSON.parse(sessionStorage.getItem('reportedComments') || '[]');
    
    if (reportedComments.includes(commentNo)) {
      alert('이미 신고한 댓글입니다.');
      return;
    }

    if (window.confirm('이 댓글을 신고하시겠습니까?')) {
      fetch(`/api/board/comment/${commentNo}/report`, {
        method: 'POST'
      })
        .then(response => response.text())
        .then(result => {
          if (result === 'success') {
            // 신고 기록 저장
            reportedComments.push(commentNo);
            sessionStorage.setItem('reportedComments', JSON.stringify(reportedComments));
            
            alert('신고가 접수되었습니다.');
            fetchComments();
          }
        })
        .catch(error => console.error('신고 에러:', error));
    }
  };
  
  const handleLike = () => {
    const endpoint = isLiked ? 'unlike' : 'like';
    fetch(`/api/board/${id}/${endpoint}`, {
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
    // 이미 신고했는지 체크
    const reportedBoards = JSON.parse(sessionStorage.getItem('reportedBoards') || '[]');
    
    if (reportedBoards.includes(parseInt(id))) {
      alert('이미 신고한 게시글입니다.');
      return;
    }

    if (window.confirm('이 게시글을 신고하시겠습니까?')) {
      fetch(`/api/board/${id}/report`, {
        method: 'POST'
      })
        .then(response => response.text())
        .then(result => {
          if (result === 'success') {
            // 신고 기록 저장
            reportedBoards.push(parseInt(id));
            sessionStorage.setItem('reportedBoards', JSON.stringify(reportedBoards));
            
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

    fetch(`/api/board/${id}`, {
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
      fetch(`/api/board/${id}`, {
        method: 'DELETE'
      })
        .then(response => response.text())
        .then(result => {
          if (result === 'success') {
            alert('삭제되었습니다.');
            navigate('/client/board')
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

  // 댓글을 계층 구조로 정렬
  const organizeComments = (comments) => {
    const organized = [];
    const commentMap = {};

    // 먼저 모든 댓글을 맵에 저장
    comments.forEach(comment => {
      commentMap[comment.commentNo] = { ...comment, replies: [] };
    });

    // 부모-자식 관계 설정
    comments.forEach(comment => {
      if (comment.parentComment === null || comment.parentComment === undefined) {
        organized.push(commentMap[comment.commentNo]);
      } else {
        if (commentMap[comment.parentComment]) {
          commentMap[comment.parentComment].replies.push(commentMap[comment.commentNo]);
        }
      }
    });

    return organized;
  };

const renderComment = (comment, depth = 0) => (
  <div key={comment.commentNo} className={`comment-item depth-${depth}`}>
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
    <div className="comment-actions">
      {/* depth가 0일 때만 답글 버튼 표시 */}
      {depth === 0 && (
        <button
          onClick={() => setReplyTo(comment.commentNo)}
          className="btn-reply"
        >
          답글
        </button>
      )}
      <button
        onClick={() => handleReportComment(comment.commentNo)}
        className="btn-comment-report"
      >
        신고
      </button>
      <button
        onClick={() => {
          if (window.confirm('댓글을 삭제하시겠습니까?')) {
            fetch(`/api/board/comment/${comment.commentNo}`, {
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

    {/* 답글 입력창도 depth 0일 때만 */}
    {replyTo === comment.commentNo && depth === 0 && (
      <div className="reply-form">
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="답글을 입력하세요"
          className="reply-textarea"
        />
        <div className="reply-buttons">
          <button onClick={() => setReplyTo(null)} className="btn-cancel-reply">취소</button>
          <button onClick={() => handleReplySubmit(comment.commentNo)} className="btn-submit-reply">답글 작성</button>
        </div>
      </div>
    )}

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

  if (!id || !board) {
    return <div className="error-message">게시글을 찾을 수 없습니다.</div>;
  }

  const organizedComments = organizeComments(comments);

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
            <>
              <p className="board-content-text">{board.boardContent}</p>
              
              {/* 이미지 표시 */}
              {board.boardImage && (
                <div className="board-image-container">
                  <img 
                    src={board.boardImage} 
                    alt="게시글 이미지" 
                    className="board-image"
                  />
                </div>
              )}
            </>
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
              <Link to="/client/board" className="btn-list">
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
          <h3 className="comment-header-title">댓글 {commentCount}개</h3>

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
            {organizedComments.length === 0 ? (
              <div className="no-comments">
                💭 아직 댓글이 없습니다.<br />
                첫 댓글을 작성해보세요!
              </div>
            ) : (
              organizedComments.map(comment => renderComment(comment))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardDetail;