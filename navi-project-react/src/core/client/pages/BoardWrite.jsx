import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../css/BoardWrite.css";

function BoardWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // 파일 선택
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  // 드래그 이벤트
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  // 파일 처리
  const handleFile = (file) => {
    if (!file) return;

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 확장자 검사
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      alert('허용되지 않은 이미지 형식입니다.');
      return;
    }

    setImage(file);

    // 미리보기
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 제거
  const removeImage = () => {
    setImage(null);
    setImagePreview('');
  };

  // 게시글 작성
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력하세요.');
      return;
    }

    try {
      setLoading(true);

      // ✅ FormData에 직접 파일 추가
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      
      // ✅ 이미지 파일 자체를 전송
      if (image) {
        formData.append('image', image);
        console.log('이미지 파일 추가:', image.name);
      }

      console.log('전송 데이터:', {
        title,
        content,
        hasImage: !!image
      });

      const token = localStorage.getItem('accessToken');

      const response = await fetch('/api/board', {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        credentials: 'include',
        body: formData
      });

      console.log('응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('에러 응답:', errorText);
        throw new Error('게시글 작성 실패');
      }

      const result = await response.json();
      console.log('작성 결과:', result);

      alert('작성되었습니다!');
      navigate('/board');
    } catch (error) {
      console.error('작성 실패:', error);
      alert('작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="board-write-container">
      <h2>게시글 작성</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength="30"
            required
          />
        </div>

        <div className="form-group">
          <label>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows="10"
            required
          />
        </div>

        {/* 이미지 업로드 영역 */}
        <div className="form-group">
          <label>이미지 (선택)</label>
          
          <div
            className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="미리보기" className="image-preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <p>이미지를 드래그하거나 클릭하여 업로드</p>
                <p className="upload-hint">(JPG, PNG, GIF, WEBP)</p>
              </div>
            )}
          </div>

          <input
            id="fileInput"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        <div className="button-group">
          <button type="button" onClick={() => navigate('/board')} disabled={loading}>
            취소
          </button>
          <button type="submit" disabled={loading}>
            {loading ? '작성 중...' : '작성'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BoardWrite;