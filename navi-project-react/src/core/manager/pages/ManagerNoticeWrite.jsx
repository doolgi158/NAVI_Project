import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createNotice, updateNotice, getNoticeById } from "./ManagerNoticeService";
import "../css/ManagerNoticeWrite.css";

function NoticeWrite() {
  const [searchParams] = useSearchParams();
  const noticeNo = searchParams.get('noticeNo');
  const navigate = useNavigate();
  const isEditMode = Boolean(noticeNo);

  const [writeData, setWriteData] = useState({
    noticeTitle: '',
    noticeContent: '',
    noticeStartDate: '',
    noticeEndDate: '',
    noticeAttachFile: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 날짜 포맷 함수
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 공지사항 조회 (수정 모드)
  const fetchNotice = useCallback(async () => {
    try {
      const data = await getNoticeById(noticeNo);
      setWriteData({
        noticeTitle: data.noticeTitle || '',
        noticeContent: data.noticeContent || '',
        noticeStartDate: data.noticeStartDate ? formatDateForInput(data.noticeStartDate) : '',
        noticeEndDate: data.noticeEndDate ? formatDateForInput(data.noticeEndDate) : '',
        noticeAttachFile: data.noticeAttachFile || ''
      });
      
      // 기존 이미지 미리보기
      if (data.noticeAttachFile) {
        setImagePreview(data.noticeAttachFile);
      }
    } catch (error) {
      console.error('공지사항을 불러오는데 실패했습니다:', error);
      alert('공지사항을 불러오는데 실패했습니다.');
    }
  }, [noticeNo]);

  useEffect(() => {
    if (isEditMode) {
      fetchNotice();
    }
  }, [isEditMode, fetchNotice]);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setWriteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 이미지 파일 처리
  const handleFile = (file) => {
    if (!file) return;

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
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

  // 이미지 파일 선택
  const handleImageSelect = (e) => {
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

  // 이미지 제거
  const removeImage = () => {
    setImage(null);
    setImagePreview('');
  };

  // 이미지 업로드
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetType', 'NOTICE');
    formData.append('targetId', noticeNo || 'temp');

    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('이미지 업로드 실패');
      }

      const data = await response.json();
      return data.data.path;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      throw error;
    }
  };

  // 첨부파일 업로드
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch('/api/adm/notice/upload', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',  // ✅ 토큰 추가
      },
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('파일 업로드 실패');
      }

      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      throw error;
    }
  };

  // 첨부파일 변경 (크기 제한 없음)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

  const token = localStorage.getItem('accessToken');
  console.log('현재 토큰:', token);

    if (!writeData.noticeTitle.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!writeData.noticeContent.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      // 이미지 업로드
      let imageUrl = imagePreview;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      // 첨부파일 업로드
      let fileUrl = writeData.noticeAttachFile;
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }

      const submitData = {
        ...writeData,
        noticeImage: imageUrl,  // 이미지 경로
        noticeAttachFile: fileUrl  // 첨부파일 경로
      };

      if (isEditMode) {
        await updateNotice(noticeNo, submitData);
        alert('수정되었습니다.');
      } else {
        await createNotice(submitData);
        alert('작성되었습니다.');
      }

      navigate('/adm/notice');
    } catch (error) {
      console.error('저장에 실패했습니다:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notice-write-container">
      <h1>{isEditMode ? '공지사항 수정' : '공지사항 작성'}</h1>

      <form onSubmit={handleSubmit}>
        <div className="write-group">
          <label>제목 *</label>
          <input
            type="text"
            name="noticeTitle"
            value={writeData.noticeTitle}
            onChange={handleChange}
            placeholder="제목을 입력하세요"
            maxLength="200"
            required
          />
        </div>

        <div className="write-group">
          <label>내용 *</label>
          <textarea
            name="noticeContent"
            value={writeData.noticeContent}
            onChange={handleChange}
            placeholder="내용을 입력하세요"
            rows="10"
            required
          />
        </div>

        <div className="write-group">
          <label>게시 시작일</label>
          <input
            type="datetime-local"
            name="noticeStartDate"
            value={writeData.noticeStartDate}
            onChange={handleChange}
          />
        </div>

        <div className="write-group">
          <label>게시 종료일</label>
          <input
            type="datetime-local"
            name="noticeEndDate"
            value={writeData.noticeEndDate}
            onChange={handleChange}
          />
        </div>

        {/* 이미지 업로드 영역 */}
        <div className="write-group">
          <label>이미지 (선택)</label>
          
          <div
            className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('imageInput').click()}
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
                <p className="upload-hint">(JPG, PNG, GIF)</p>
              </div>
            )}
          </div>

          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* 첨부파일 업로드 */}
        <div className="write-group">
          <label>첨부파일</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
          />
          {selectedFile && (
            <div className="file-info">
              선택된 파일: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </div>
          )}
          {writeData.noticeAttachFile && !selectedFile && (
            <div className="file-info">
              기존 첨부파일: <a href={writeData.noticeAttachFile} target="_blank" rel="noopener noreferrer">다운로드</a>
            </div>
          )}
        </div>

        <div className="button-group">
          <button type="button" onClick={() => navigate('/adm/notice')}>
            취소
          </button>
          <button type="submit" disabled={loading}>
            {loading ? '처리중...' : (isEditMode ? '수정' : '작성')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoticeWrite;