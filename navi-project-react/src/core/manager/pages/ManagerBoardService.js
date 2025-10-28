// 관리자용 게시판 API 서비스
const API_URL = '/api/board';

// 게시판 전체 목록 조회 (페이징)
export const getAllBoards = async (page = 0, size = 10) => {
  try {
    const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('getAllBoards 에러:', error);
    throw error;
  }
};

// 게시판 검색 (페이징)
export const searchBoards = async (keyword, page = 0, size = 10) => {
  try {
    const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('searchBoards 에러:', error);
    throw error;
  }
};

// 게시글 상세 조회
export const getBoardById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('getBoardById 에러:', error);
    throw error;
  }
};

// 게시글 삭제 (관리자)
export const deleteBoard = async (id) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('deleteBoard 에러:', error);
    throw error;
  }
};