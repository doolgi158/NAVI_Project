import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
    <div style={{
      fontFamily: "'Malgun Gothic', sans-serif",
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '2px solid #333'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#007bff'
          }}>일반 게시판</div>
          <Link
            to="/board"
            style={{
              padding: '8px 20px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'none',
              color: '#333'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f8f8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            목록보기
          </Link>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength="30"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '15px'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#007bff'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
          />

          <textarea
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '400px',
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: "'Malgun Gothic', sans-serif",
              marginBottom: '20px'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#007bff'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
          />

          <div style={{ textAlign: 'right' }}>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('작성 중인 내용이 사라집니다. 목록으로 돌아가시겠습니까?')) {
                  navigate('/board');
                }
              }}
              style={{
                padding: '10px 30px',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                marginRight: '10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f8f8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              취소
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 30px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BoardWrite;