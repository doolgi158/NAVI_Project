import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getNoticeById } from "./NoticeService";
import "../css/NoticeDetail.css";
import MainLayout from '@/users/layout/MainLayout';

function NoticeDetail() {
  const [searchParams] = useSearchParams();
  const noticeNo = searchParams.get('noticeNo');
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    if (noticeNo) {
      fetchNotice();
    } else {
      alert('잘못된 접근입니다.');
      navigate('/client/notice');
    }
  }, [noticeNo, navigate]);

  const fetchNotice = async () => {
    try {
      setLoading(true);
      const data = await getNoticeById(noticeNo);
      console.log('공지사항 데이터:', data);
      console.log('이미지 경로:', data.noticeImage);
      setNotice(data);
    } catch (error) {
      console.error('공지사항을 불러오는데 실패했습니다:', error);
      alert('공지사항을 불러오는데 실패했습니다.');
      navigate('/client/notice');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading">로딩 중...</div>
      </MainLayout>
    );
  }

  if (!notice) {
    return (
      <MainLayout>
        <div>공지사항을 찾을 수 없습니다.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
    <div className="notice-detail-container">
      <h1>공지사항</h1>

      <div className="notice-info">
        <div className="info-row">
          <span className="label">제목:</span>
          <span className="value">{notice.noticeTitle}</span>
        </div>
        <div className="info-row">
          <span className="label">작성일:</span>
          <span className="value">{formatDate(notice.createDate)}</span>
        </div>
        <div className="info-row">
          <span className="label">조회수:</span>
          <span className="value">{notice.noticeViewCount || 0}</span>
        </div>
        {notice.noticeStartDate && (
          <div className="info-row">
            <span className="label">게시 시작일:</span>
            <span className="value">{formatDate(notice.noticeStartDate)}</span>
          </div>
        )}
        {notice.noticeEndDate && (
          <div className="info-row">
            <span className="label">게시 종료일:</span>
            <span className="value">{formatDate(notice.noticeEndDate)}</span>
          </div>
        )}
      </div>

      {/* 이미지 표시 영역 */}
      {notice.noticeImage && (
        <div className="notice-image">
          <img 
            src={notice.noticeImage}
            alt={notice.noticeTitle}
            onError={(e) => {
              console.error('이미지 로딩 실패:', e.target.src);
              e.target.style.display = 'none';
            }}
            onLoad={(e) => {
              console.log('이미지 로딩 성공:', e.target.src);
            }}
          />
        </div>
      )}

      <div className="notice-content">
        <h3></h3>
        <div className="content-text">
          {notice.noticeContent}
        </div>
      </div>

      {notice.noticeFile && (
        <div className="notice-attachment">
          <span className="label">첨부파일:</span>
          <a href={notice.noticeFile} download>
            {notice.noticeFile.split('/').pop()}
          </a>
        </div>
      )}

      <div className="button-group">
        <button onClick={() => navigate('/client/notice')}>목록</button>
      </div>
    </div>
    </MainLayout>
  );
}

export default NoticeDetail;