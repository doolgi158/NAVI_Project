// 사용자용 게시판 API 서비스
const API_URL = '/api/notice';

// 게시글 전체 목록 조회
export const getAllBoards = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

// 게시글 검색
export const searchBoards = async (keyword) => {
  const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`);
  return response.json();
};

// 게시글 상세 조회
export const getBoardById = async (boardNo) => {
  const response = await fetch(`${API_URL}/${boardNo}`);
  return response.json();
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