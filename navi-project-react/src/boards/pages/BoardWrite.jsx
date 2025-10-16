import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "../css/BoardWrite.css";

function BoardWrite() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    fetch('http://localhost:8080/api/board', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    })
      .then(response => {
        if (response.ok) {
          alert('게시글이 등록되었습니다.');
          navigate('/board');
        } else {
          alert('게시글 등록에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('에러:', error);
        alert('게시글 등록 중 오류가 발생했습니다.');
      });
  };

  return (
    <div className="board-write-container">
      <div className="board-write-wrapper">
        {/* 헤더 */}
        <div className="board-write-header">
          <div className="board-write-title">일반 게시판</div>
          <Link to="/board" className="btn-list">
            목록보기
          </Link>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="write-form">
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength="30"
            className="title-input"
          />

          <textarea
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="content-input"
          />

          <div className="write-footer">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('작성 중인 내용이 사라집니다. 목록으로 돌아가시겠습니까?')) {
                  navigate('/board');
                }
              }}
              className="btn-cancel"
            >
              취소
            </button>
            <button type="submit" className="btn-submit">
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BoardWrite;
