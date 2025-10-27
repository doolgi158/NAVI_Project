// 관리자용 공지사항 API 서비스
const API_URL = '/admin/api/notice';

// 토큰 가져오기
const getToken = () => {
  return localStorage.getItem('accessToken') || 
         sessionStorage.getItem('accessToken');
};

// 공통 헤더
const getHeaders = (includeJson = true) => {
  const token = getToken();
  const headers = {};

  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// 공지사항 전체 목록 조회 (페이징)
export const getAllNotices = async (page = 0, size = 10) => {
  const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
    headers: getHeaders(),
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('공지사항 목록 조회 실패');
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : { notices: [], currentPage: 0, totalPages: 0, totalItems: 0 };
};

// 공지사항 상세 조회 (조회수 증가 없음)
export const getNoticeById = async (noticeNo) => {
  const response = await fetch(`${API_URL}/${noticeNo}`, {
    headers: getHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('공지사항 조회 실패');
  }

  return await response.json();
};

// 공지사항 작성
export const createNotice = async (noticeData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(noticeData)
  });
  
  if (!response.ok) {
    throw new Error('공지사항 작성 실패');
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

// 공지사항 수정
export const updateNotice = async (noticeNo, noticeData) => {
  const response = await fetch(`${API_URL}/${noticeNo}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(noticeData)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('API 에러:', error);
    throw new Error('공지사항 수정 실패');
  }

  return await response.json();
};

// 공지사항 삭제
export const deleteNotice = async (noticeNo) => {
  const response = await fetch(`${API_URL}/${noticeNo}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('공지사항 삭제 실패');
  }
};

// 공지사항 검색 (페이징)
export const searchNotice = async (keyword, page = 0, size = 10) => {
  const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, {
    headers: getHeaders(),
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('공지사항 검색 실패');
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : { notices: [], currentPage: 0, totalPages: 0, totalItems: 0 };
};