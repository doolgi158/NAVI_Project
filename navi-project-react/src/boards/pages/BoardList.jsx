import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
    return <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>;
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
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          paddingBottom: '15px',
          borderBottom: '2px solid #333'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333'
          }}>일반 게시판</div>
          <Link 
            to="/board/write"
            style={{
              padding: '10px 25px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
          >
            ✏️ 글쓰기
          </Link>
        </div>

        {/* 검색 박스 */}
        <div style={{
          display: 'flex',
          gap: '5px',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '300px',
              fontSize: '14px'
            }}
          />
          <button
            style={{
              padding: '8px 15px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f8f8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            🔍 검색
          </button>
        </div>

        {/* 게시글 목록 */}
        <div style={{ borderTop: '2px solid #333', minHeight: '300px' }}>
          {boards.length === 0 ? (
            <div style={{
              padding: '80px 20px',
              textAlign: 'center',
              color: '#999',
              fontSize: '15px'
            }}>
              등록된 게시글이 없습니다.<br />
              첫 게시글을 작성해보세요!
            </div>
          ) : (
            boards.map(board => (
              <Link
                key={board.boardNo}
                to={`/board/detail?id=${board.boardNo}`}
                style={{
                  display: 'block',
                  padding: '20px',
                  borderBottom: '1px solid #eee',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '10px'
                }}>
                  {board.boardTitle}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  fontSize: '13px',
                  color: '#999'
                }}>
                  <span>{new Date(board.createDate).toLocaleDateString('ko-KR')} {new Date(board.createDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</span>
                  <span>사용자 {board.userNo}</span>
                  <span>❤️ {board.boardGood}</span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <div style={{
            display: 'flex',
            gap: '5px',
            alignItems: 'center'
          }}>
            <button
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              ◀ 이전
            </button>
            <input
              type="text"
              value="1"
              readOnly
              style={{
                width: '60px',
                padding: '8px',
                textAlign: 'center',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              다음 ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardList;