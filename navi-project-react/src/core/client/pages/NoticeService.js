// 사용자용 공지사항 API 서비스
const API_URL = '/api/notice';

// 공지사항 전체 목록 조회 (페이징 지원)
export const getNotices = async (page = 0, size = 10) => {
  const response = await fetch(`${API_URL}?page=${page}&size=${size}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : { notices: [], currentPage: 0, totalPages: 0, totalItems: 0 };
};

// 공지사항 상세 조회 (조회수 증가 포함)
export const getNoticeById = async (noticeNo) => {
  const response = await fetch(`${API_URL}/${noticeNo}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// 공지사항 검색 (페이징 지원)
export const searchNotices = async (keyword, page = 0, size = 10) => {
  const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : { notices: [], currentPage: 0, totalPages: 0, totalItems: 0 };
};
