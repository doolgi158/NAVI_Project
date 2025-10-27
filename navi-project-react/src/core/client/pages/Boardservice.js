import axios from 'axios';

// 사용자용 게시판 API 서비스
const API_URL = 'http://localhost:8080/api/board';

// 게시판 전체 목록 조회 (페이징)
export const getAllBoards = async (page = 0, size = 10) => {
  const response = await fetch(`${API_URL}?page=${page}&size=${size}`, {
    credentials: 'include'  // ✅ credentials 추가
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
};

// 게시판 검색 (페이징)
export const searchBoards = async (keyword, page = 0, size = 10) => {
  const response = await axios.get(`${API_URL}/search`, {
    params: { keyword, page, size },
  });
  return response.data;
};

// 게시글 상세 조회
export const getBoardById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
};

// 게시글 작성
export const createBoard = async (boardData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(boardData)
  });
  return response.json();
};

// 게시글 수정
export const updateBoard = async (boardNo, boardData) => {
  const response = await fetch(`${API_URL}/${boardNo}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(boardData)
  });
  return response.json();
};

// 게시글 삭제
export const deleteBoard = async (boardNo) => {
  await fetch(`${API_URL}/${boardNo}`, {
    method: 'DELETE'
  });
};

// 좋아요
export const likeBoard = async (boardNo) => {
  await fetch(`${API_URL}/${boardNo}/like`, {
    method: 'POST'
  });
};

// 좋아요 취소
export const unlikeBoard = async (boardNo) => {
  await fetch(`${API_URL}/${boardNo}/unlike`, {
    method: 'POST'
  });
};

// 신고
export const reportBoard = async (boardNo) => {
  await fetch(`${API_URL}/${boardNo}/report`, {
    method: 'POST'
  });
};

// 이미지 업로드
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data.imageUrl;
};

// 댓글 목록 조회
export const getComments = async (boardNo) => {
  const response = await fetch(`${API_URL}/${boardNo}/comments`);
  return response.json();
};

// 댓글 작성
export const createComment = async (boardNo, content) => {
  await fetch(`${API_URL}/${boardNo}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
};

// 대댓글 작성
export const createReply = async (boardNo, parentCommentNo, content) => {
  await fetch(`${API_URL}/${boardNo}/comment/${parentCommentNo}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
};

// 댓글 삭제
export const deleteComment = async (commentId) => {
  await fetch(`${API_URL}/comment/${commentId}`, {
    method: 'DELETE'
  });
};

// 댓글 신고
export const reportComment = async (commentId) => {
  await fetch(`${API_URL}/comment/${commentId}/report`, {
    method: 'POST'
  });
};