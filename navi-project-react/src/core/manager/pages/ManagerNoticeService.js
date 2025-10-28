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
  try {
    const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
      headers: getHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('공지사항 목록 조회 실패');
    }
    
    const text = await response.text();
    const data = text ? JSON.parse(text) : { notices: [], currentPage: 0, totalPages: 0, totalItems: 0 };
    
    console.log('📦 관리자 공지사항 API 응답:', data);
    
    // 응답 구조 검증
    if (!data) {
      return { notices: [], currentPage: 0, totalPages: 0, totalItems: 0 };
    }
    
    // notices가 배열인지 확인
    if (data.notices && !Array.isArray(data.notices)) {
      console.error('⚠️ notices가 배열이 아닙니다:', data.notices);
      return { notices: [], currentPage: 0, totalPages: 0, totalItems: 0 };
    }
    
    // content를 notices로 변환
    if (data.content && Array.isArray(data.content)) {
      return {
        notices: data.content,
        currentPage: data.number || data.currentPage || 0,
        totalPages: data.totalPages || 0,
        totalItems: data.totalElements || data.totalItems || 0
      };
    }
    
    return data;
  } catch (error) {
    console.error('❌ getAllNotices 에러:', error);
    return { notices: [], currentPage: 0, totalPages: 0, totalItems: 0 };
  }
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

// ✅ 공지사항 작성 - FormData 방식으로 수정
export const createNotice = async (noticeData) => {
  try {
    console.log('📤 공지사항 작성 요청:', noticeData);
    
    // FormData 생성
    const formData = new FormData();
    formData.append('title', noticeData.noticeTitle || '');
    formData.append('content', noticeData.noticeContent || '');
    
    // 날짜는 있을 때만 추가
    if (noticeData.noticeStartDate) {
      formData.append('startDate', noticeData.noticeStartDate);
    }
    if (noticeData.noticeEndDate) {
      formData.append('endDate', noticeData.noticeEndDate);
    }
    
    // ✅ 이미지 URL을 문자열로 추가 (이미 업로드된 경우)
    if (noticeData.noticeImage) {
      formData.append('imageUrl', noticeData.noticeImage);
    }
    
    // ✅ 파일 URL을 문자열로 추가 (이미 업로드된 경우)
    if (noticeData.noticeFile) {
      formData.append('fileUrl', noticeData.noticeFile);
    }
    
    const token = getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: formData
    });
    
    console.log('📥 응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 서버 에러 응답:', errorText);
      throw new Error(`공지사항 작성 실패 (${response.status}): ${errorText}`);
    }
    
    const text = await response.text();
    console.log('✅ 작성 성공:', text);
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('❌ createNotice 에러:', error);
    throw error;
  }
};

// ✅ 공지사항 수정 - FormData 방식으로 수정
export const updateNotice = async (noticeNo, noticeData) => {
  try {
    console.log('📤 공지사항 수정 요청:', noticeData);
    
    // FormData 생성
    const formData = new FormData();
    formData.append('title', noticeData.noticeTitle || '');
    formData.append('content', noticeData.noticeContent || '');
    
    // 날짜는 있을 때만 추가
    if (noticeData.noticeStartDate) {
      formData.append('startDate', noticeData.noticeStartDate);
    }
    if (noticeData.noticeEndDate) {
      formData.append('endDate', noticeData.noticeEndDate);
    }
    
    // ✅ 이미지 URL을 문자열로 추가 (이미 업로드된 경우)
    if (noticeData.noticeImage) {
      formData.append('imageUrl', noticeData.noticeImage);
    }
    
    // ✅ 파일 URL을 문자열로 추가 (이미 업로드된 경우)
    if (noticeData.noticeFile) {
      formData.append('fileUrl', noticeData.noticeFile);
    }
    
    const token = getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/${noticeNo}`, {
      method: 'PUT',
      headers: headers,
      credentials: 'include',
      body: formData
    });

    console.log('📥 응답 상태:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API 에러:', error);
      throw new Error(`공지사항 수정 실패 (${response.status}): ${error}`);
    }

    const text = await response.text();
    console.log('✅ 수정 성공:', text);
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('❌ updateNotice 에러:', error);
    throw error;
  }
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
  try {
    const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, {
      headers: getHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('공지사항 검색 실패');
    }
    
    const text = await response.text();
    const data = text ? JSON.parse(text) : { notices: [], currentPage: 0, totalPages: 0, totalItems: 0 };
    
    console.log('🔍 관리자 공지사항 검색 응답:', data);
    
    // 응답 구조 검증
    if (!data) {
      return { notices: [], currentPage: 0, totalPages: 0, totalItems: 0 };
    }
    
    // notices가 배열인지 확인
    if (data.notices && !Array.isArray(data.notices)) {
      console.error('⚠️ notices가 배열이 아닙니다:', data.notices);
      return { notices: [], currentPage: 0, totalPages: 0, totalItems: 0 };
    }
    
    // content를 notices로 변환
    if (data.content && Array.isArray(data.content)) {
      return {
        notices: data.content,
        currentPage: data.number || data.currentPage || 0,
        totalPages: data.totalPages || 0,
        totalItems: data.totalElements || data.totalItems || 0
      };
    }
    
    return data;
  } catch (error) {
    console.error('❌ searchNotice 에러:', error);
    return { notices: [], currentPage: 0, totalPages: 0, totalItems: 0 };
  }
};