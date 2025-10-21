import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createNotice, updateNotice, getNoticeById } from "./ManagerNoticeService";
import "../css/NoticeWrite.css";

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
  } catch (error) {
    console.error('공지사항을 불러오는데 실패했습니다:', error);
    alert('공지사항을 불러오는데 실패했습니다.');
  }
}, [noticeNo]);

useEffect(() => {
  if (isEditMode) {
    fetchNotice();
  }
}, [isEditMode, fetchNotice]);  //fetchNotice 함수가 필요할 때만 새로 생성됌.

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWriteData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('파일 크기는 10MB를 초과할 수 없습니다.');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/notice/upload', {
        method: 'POST',
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      let fileUrl = writeData.noticeAttachFile;
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }

      const submitData = {
        ...writeData,
        noticeAttachFile: fileUrl
      };

      if (isEditMode) {
        await updateNotice(noticeNo, submitData);
        alert('수정되었습니다.');
      } else {
        await createNotice(submitData);
        alert('작성되었습니다.');
      }

      navigate('/manager/notice');
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

        <div className="write-group">
          <label>첨부파일</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip"
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
          <button type="button" onClick={() => navigate('/notice')}>
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