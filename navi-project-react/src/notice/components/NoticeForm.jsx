// src/components/NoticeForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createNotice, updateNotice, getNoticeById } from '../services/noticeService';
import './NoticeForm.css';

function NoticeForm() {
  const { noticeNo } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(noticeNo);

  const [formData, setFormData] = useState({
    noticeTitle: '',
    noticeContent: '',
    noticeStartDate: '',
    noticeEndDate: '',
    noticeAttachFile: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchNotice();
    }
  }, [noticeNo]);

  const fetchNotice = async () => {
    try {
      const data = await getNoticeById(noticeNo);
      setFormData({
        noticeTitle: data.noticeTitle || '',
        noticeContent: data.noticeContent || '',
        noticeStartDate: data.noticeStartDate ? data.noticeStartDate.slice(0, 16) : '',
        noticeEndDate: data.noticeEndDate ? data.noticeEndDate.slice(0, 16) : '',
        noticeAttachFile: data.noticeAttachFile || ''
      });
    } catch (error) {
      console.error('공지사항을 불러오는데 실패했습니다:', error);
      alert('공지사항을 불러오는데 실패했습니다.');
      navigate('/notices');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.noticeTitle.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!formData.noticeContent.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        await updateNotice(noticeNo, formData);
        alert('수정되었습니다.');
      } else {
        await createNotice(formData);
        alert('작성되었습니다.');
      }

      navigate('/notices');
    } catch (error) {
      console.error('저장에 실패했습니다:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notice-form-container">
      <h1>{isEditMode ? '공지사항 수정' : '공지사항 작성'}</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>제목 *</label>
          <input
            type="text"
            name="noticeTitle"
            value={formData.noticeTitle}
            onChange={handleChange}
            placeholder="제목을 입력하세요"
            maxLength="200"
            required
          />
        </div>

        <div className="form-group">
          <label>내용 *</label>
          <textarea
            name="noticeContent"
            value={formData.noticeContent}
            onChange={handleChange}
            placeholder="내용을 입력하세요"
            rows="10"
            required
          />
        </div>

        <div className="form-group">
          <label>게시 시작일</label>
          <input
            type="datetime-local"
            name="noticeStartDate"
            value={formData.noticeStartDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>게시 종료일</label>
          <input
            type="datetime-local"
            name="noticeEndDate"
            value={formData.noticeEndDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>첨부파일 URL</label>
          <input
            type="text"
            name="noticeAttachFile"
            value={formData.noticeAttachFile}
            onChange={handleChange}
            placeholder="첨부파일 URL을 입력하세요"
          />
        </div>

        <div className="button-group">
          <button type="button" onClick={() => navigate('/notices')}>
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

export default NoticeForm;