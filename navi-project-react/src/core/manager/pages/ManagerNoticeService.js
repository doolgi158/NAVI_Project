// 관리자용 공지사항 API 서비스
const API_URL = '/api/admin/notice';

// 공지사항 전체 목록 조회
export const getAllNotices = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

// 공지사항 상세 조회 (조회수 증가 없음)
export const getNoticeById = async (noticeNo) => {
  const response = await fetch(`${API_URL}/${noticeNo}`);
  return response.json();
};

// 공지사항 작성
export const createNotice = async (noticeData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noticeData)
  });
  return response.json();
};

// 공지사항 수정
export const updateNotice = async (noticeNo, noticeData) => {
  const response = await fetch(`${API_URL}/${noticeNo}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noticeData)
  });
  return response.json();
};

// 공지사항 삭제
export const deleteNotice = async (noticeNo) => {
  await fetch(`${API_URL}/${noticeNo}`, {
    method: 'DELETE'
  });
};

// 공지사항 검색
export const searchNotice = async (keyword) => {
  const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`);
  return response.json();
};

// 파일 업로드
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data.fileUrl;
};