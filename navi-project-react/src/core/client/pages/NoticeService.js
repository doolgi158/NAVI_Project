// 사용자용 공지사항 API 서비스
const API_URL = '/api/notice';

// 공지사항 전체 목록 조회
export const getAllNotices = async () => {
  const response = await fetch(API_URL);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : [];
};

// 공지사항 상세 조회 (조회수 증가)
export const getNoticeById = async (noticeNo) => {
  const response = await fetch(`${API_URL}/${noticeNo}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// 공지사항 검색
export const searchNotice = async (keyword) => {
  const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : [];
};