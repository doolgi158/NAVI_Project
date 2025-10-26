// 관리자용 게시판 API 서비스
const API_URL = '/api/admin/board';

// 게시글 전체 목록 조회
export const getAllBoards = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

// 게시글 상세 조회
export const getBoardById = async (boardNo) => {
  const response = await fetch(`${API_URL}/${boardNo}`);
  return response.json();
};

// 게시글 삭제 (관리자 - 모든 게시글 삭제 가능)
export const deleteBoard = async (boardNo) => {
  await fetch(`${API_URL}/${boardNo}`, {
    method: 'DELETE'
  });
};

// 신고된 게시글 목록 조회 (관리자 전용)
export const getReportedBoards = async () => {
  const response = await fetch(`${API_URL}/reported`);
  return response.json();
};