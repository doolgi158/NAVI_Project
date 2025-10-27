import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getNoticeById, deleteNotice } from "./ManagerNoticeService";
import "../css/ManagerNoticeDetail.css";

function NoticeDetail() {
  const [searchParams] = useSearchParams();
  const noticeNo = searchParams.get('noticeNo');
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const data = await getNoticeById(noticeNo);
        setNotice(data);
      } catch (error) {
        console.error('공지사항을 불러오는데 실패했습니다:', error);
        alert('공지사항을 불러오는데 실패했습니다.');
        navigate('/adm/notice');
      } finally {
        setLoading(false);
      }
    };

    if (noticeNo) {
      fetchNotice();
    } else {
      alert('잘못된 접근입니다.');
      navigate('/adm/notice');
    }
  }, [noticeNo, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteNotice(noticeNo);
      alert('삭제되었습니다.');
      navigate('/adm/notice');
    } catch (error) {
      console.error('삭제에 실패했습니다:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!notice) {
    return <div>공지사항을 찾을 수 없습니다.</div>;
  }

  return (
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

      {/* 이미지 표시 영역 추가 */}
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
            {notice.noticeFile.split('/').pop()}  {/* ✅ 파일명만 표시 */}
          </a>
        </div>
      )}

      <div className="button-group">
        <button onClick={() => navigate('/adm/notice')}>목록</button>
        <button onClick={() => navigate(`/adm/notice/write?noticeNo=${noticeNo}`)}>수정</button>
        <button className="delete-button" onClick={handleDelete}>삭제</button>
      </div>
    </div>
  );
}

export default NoticeDetail;