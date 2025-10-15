import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

function BoardDetail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  
  const [board, setBoard] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

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
    return <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>;
  }

  if (!id || !board) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{
      fontFamily: "'Malgun Gothic', sans-serif",
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* 게시글 헤더 */}
        <div style={{
          borderBottom: '2px solid #333',
          paddingBottom: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '24px',
            marginBottom: '15px',
            color: '#333'
          }}>{board.boardTitle}</h2>
          <div style={{
            display: 'flex',
            gap: '20px',
            color: '#666',
            fontSize: '14px'
          }}>
            <p style={{ margin: 0 }}>📌 번호: {board.boardNo}</p>
            <p style={{ margin: 0 }}>📅 작성일: {new Date(board.createDate).toLocaleDateString('ko-KR')} {new Date(board.createDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
            <p style={{ margin: 0 }}>👤 작성자: {board.userNo}</p>
            <p style={{ margin: 0 }}>❤️ 좋아요: {board.boardGood}</p>
            <p style={{ margin: 0 }}>🚨 신고: {board.reportCount}</p>
          </div>
        </div>

        {/* 게시글 내용 */}
        <div style={{
          minHeight: '300px',
          padding: '30px 0',
          borderBottom: '1px solid #eee'
        }}>
          <p style={{
            lineHeight: '1.8',
            color: '#444',
            whiteSpace: 'pre-wrap',
            fontSize: '15px'
          }}>{board.boardContent}</p>
        </div>

        {/* 버튼 */}
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link
            to="/board"
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              textDecoration: 'none',
              color: '#333',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f8f8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            📋 목록으로
          </Link>
          <button
            onClick={handleReport}
            style={{
              padding: '8px 16px',
              backgroundColor: 'white',
              border: '1px solid #dc3545',
              borderRadius: '4px',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc3545';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#dc3545';
            }}
          >
            🚨 신고하기
          </button>
        </div>

        {/* 댓글 섹션 */}
        <div style={{
          marginTop: '40px',
          paddingTop: '30px',
          borderTop: '2px solid #333'
        }}>
          <h3 style={{
            fontSize: '18px',
            marginBottom: '20px'
          }}>💬 댓글 {commentCount}개</h3>

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} style={{ marginBottom: '30px' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요 (최대 500자)"
              maxLength="500"
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: "'Malgun Gothic', sans-serif",
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '10px'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#007bff'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
            />
            <button
              type="submit"
              style={{
                padding: '10px 25px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              댓글 작성
            </button>
          </form>

          {/* 댓글 목록 */}
          <div style={{ marginTop: '20px' }}>
            {comments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#999',
                fontSize: '15px'
              }}>
                💭 아직 댓글이 없습니다.<br />
                첫 댓글을 작성해보세요!
              </div>
            ) : (
              comments.map(comment => (
                <div
                  key={comment.commentNo}
                  style={{
                    padding: '20px',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    backgroundColor: '#fafafa'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <span style={{
                      fontWeight: 'bold',
                      color: '#333'
                    }}>👤 사용자 {comment.userNo}</span>
                    <span>{new Date(comment.createDate).toLocaleDateString('ko-KR')} {new Date(comment.createDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                  <div style={{
                    marginBottom: '12px',
                    lineHeight: '1.6',
                    color: '#333',
                    fontSize: '14px'
                  }}>
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
                    style={{
                      padding: '5px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #dc3545',
                      borderRadius: '4px',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc3545';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#dc3545';
                    }}
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