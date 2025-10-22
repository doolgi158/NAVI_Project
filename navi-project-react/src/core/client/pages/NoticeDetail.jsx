import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import "../css/BoardDetail.css";
import MainLayout from '@/users/layout/MainLayout';

function BoardDetail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  
  const [board, setBoard] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
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

    fetch(`/api/board/${id}/comment`, {  // ✅ /comments → /comment
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
    const reportedComments = JSON.parse(sessionStorage.getItem('reportedComments') || '[]');
    
    if (reportedComments.includes(commentNo)) {
      alert('이미 신고한 댓글입니다.');
      return;
    }

    if (window.confirm('이 댓글을 신고하시겠습니까?')) {
      fetch(`/api/board/comment/${commentNo}/report`, {
        method: 'POST'
      })
        .then(() => {
          reportedComments.push(commentNo);
          sessionStorage.setItem('reportedComments', JSON.stringify(reportedComments));
          alert('신고가 접수되었습니다.');
          fetchComments();
        })
        .catch(error => console.error('신고 에러:', error));
    }
  };
  
  // 좋아요/좋아요 취소
  const handleLike = () => {
    if (isLiked) {
      // 좋아요 취소
      fetch(`/api/board/${id}/like`, {
        method: 'DELETE'  // ✅ DELETE 메서드 사용
      })
        .then(() => {
          setIsLiked(false);
          fetchBoard();
        })
        .catch(error => console.error('좋아요 취소 에러:', error));
    } else {
      // 좋아요
      fetch(`/api/board/${id}/like`, {
        method: 'POST'
      })
        .then(() => {
          setIsLiked(true);
          fetchBoard();
        })
        .catch(error => console.error('좋아요 에러:', error));
    }
  };

  // 게시글 신고
  const handleReport = () => {
    const reportedBoards = JSON.parse(sessionStorage.getItem('reportedBoards') || '[]');
    
    if (reportedBoards.includes(parseInt(id))) {
      alert('이미 신고한 게시글입니다.');
      return;
    }

    if (window.confirm('이 게시글을 신고하시겠습니까?')) {
      fetch(`/api/board/${id}/report`, {
        method: 'POST'
      })
        .then(() => {
          reportedBoards.push(parseInt(id));
          sessionStorage.setItem('reportedBoards', JSON.stringify(reportedBoards));
          alert('신고가 접수되었습니다.');
        })
        .catch(error => console.error('신고 에러:', error));
    }
  };

  // 게시글 삭제
  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      fetch(`/api/board/${id}`, {
        method: 'DELETE'
      })
        .then(() => {
          alert('삭제되었습니다.');
          navigate('/board');
        })
        .catch(error => {
          console.error('삭제 실패:', error);
          alert('삭제에 실패했습니다. (본인이 작성한 글만 삭제 가능)');
        });
    }
  };

  // 댓글 삭제
  const handleDeleteComment = (commentNo) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      fetch(`/api/board/comment/${commentNo}`, {
        method: 'DELETE'
      })
        .then(() => {
          alert('댓글이 삭제되었습니다.');
          fetchComments();
        })
        .catch(error => {
          console.error('댓글 삭제 실패:', error);
          alert('댓글 삭제에 실패했습니다. (본인이 작성한 댓글만 삭제 가능)');
        });
    }
  };

  // 수정 모드 전환
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // 게시글 수정 저장
  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 입력하세요.');
      return;
    }

    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('content', editContent);

    fetch(`/api/board/${id}`, {
      method: 'PUT',
      body: formData
    })
      .then(() => {
        alert('수정되었습니다.');
        setIsEditing(false);
        fetchBoard();
      })
      .catch(error => {
        console.error('수정 실패:', error);
        alert('수정에 실패했습니다. (본인이 작성한 글만 수정 가능)');
      });
  };

  if (loading) {
    return <MainLayout><div className="loading-message">로딩 중...</div></MainLayout>;
  }

  if (!board) {
    return <MainLayout><div>게시글을 찾을 수 없습니다.</div></MainLayout>;
  }

  return (
    <MainLayout>
    <div className="board-detail-container">
      {/* 상단 메뉴 */}
      <div className="board-header">
        <Link to="/board" className="back-button">← 목록</Link>
        <div className="menu-container">
          <button className="menu-button" onClick={() => setShowMenu(!showMenu)}>
            ⋮
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={toggleEdit}>수정</button>
              <button onClick={handleDelete}>삭제</button>
              <button onClick={handleReport}>신고</button>
            </div>
          )}
        </div>
      </div>

      {/* 게시글 내용 */}
      {isEditing ? (
        <div className="edit-mode">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="edit-title"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-content"
            rows="10"
          />
          <div className="edit-buttons">
            <button onClick={handleSaveEdit}>저장</button>
            <button onClick={toggleEdit}>취소</button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="board-title">{board.boardTitle}</h1>
          <div className="board-meta">
            <span>작성자: 사용자 {board.userNo}</span>
            <span>작성일: {new Date(board.createDate).toLocaleString('ko-KR')}</span>
            <span>조회수: {board.boardViewCount}</span>
          </div>
          <div className="board-content">{board.boardContent}</div>
          {board.boardImage && (
            <div className="board-image">
              <img src={board.boardImage} alt="게시글 이미지" />
            </div>
          )}
        </>
      )}

      {/* 좋아요 버튼 */}
      <div className="action-buttons">
        <button 
          className={`like-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {isLiked ? '❤️' : '🤍'} {board.boardGood}
        </button>
      </div>

      {/* 댓글 섹션 */}
      <div className="comments-section">
        <h3>댓글 ({commentCount})</h3>
        
        {/* 댓글 작성 */}
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            rows="3"
          />
          <button type="submit">댓글 작성</button>
        </form>

        {/* 댓글 목록 */}
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.commentNo} className={`comment-item ${comment.parentComment ? 'reply' : ''}`}>
              <div className="comment-header">
                <span className="comment-author">사용자 {comment.userNo}</span>
                <span className="comment-date">
                  {new Date(comment.createDate).toLocaleString('ko-KR')}
                </span>
              </div>
              <div className="comment-content">{comment.commentContent}</div>
              <div className="comment-actions">
                <button onClick={() => setReplyTo(comment.commentNo)}>답글</button>
                <button onClick={() => handleDeleteComment(comment.commentNo)}>삭제</button>
                <button onClick={() => handleReportComment(comment.commentNo)}>신고</button>
              </div>

              {/* 답글 작성 폼 */}
              {replyTo === comment.commentNo && (
                <div className="reply-form">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="답글을 입력하세요"
                    rows="2"
                  />
                  <div className="reply-buttons">
                    <button onClick={() => handleReplySubmit(comment.commentNo)}>작성</button>
                    <button onClick={() => setReplyTo(null)}>취소</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </MainLayout>
  );
}

export default BoardDetail;