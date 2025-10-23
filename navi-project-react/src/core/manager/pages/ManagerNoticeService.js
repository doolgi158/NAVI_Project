// 관리자용 공지사항 API 서비스
const API_URL = '/api/adm/notice';

// 토큰 가져오기
const getToken = () => {
  return localStorage.getItem('accessToken') || 
         sessionStorage.getItem('accessToken');
};

// 공통 헤더 (includeJson: true -> adds Content-Type, false -> omit for FormData)
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

// 공지사항 전체 목록 조회
export const getAllNotices = async () => {
  const response = await fetch(API_URL, {
    headers: getHeaders()
  });
  return response.json();
};

// 공지사항 작성
export const createNotice = async (noticeData) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/adm/notice', {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(noticeData)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('API 에러:', error);
    throw new Error('공지사항 작성 실패');
  }

  return await response.json();
};


// 공지사항 수정
export const updateNotice = async (noticeNo, noticeData) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`/api/adm/notice/${noticeNo}`, {
    method: 'PUT',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    },
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

export const getNoticeById = async (noticeNo) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`/api/adm/notice/${noticeNo}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('공지사항 조회 실패');
  }

  return await response.json();
};

// 공지사항 삭제
export const deleteNotice = async (noticeNo) => {
  await fetch(`${API_URL}/${noticeNo}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
};

// 공지사항 검색
export const searchNotice = async (keyword) => {
  const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`, {
    headers: getHeaders()
  });
  return response.json();
};

// 파일 업로드
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: getHeaders(false),
    body: formData
  });

  const data = await response.json();
  return data.fileUrl;
};