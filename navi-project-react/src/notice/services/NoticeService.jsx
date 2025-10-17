// src/services/noticeService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/notices';

// 공지사항 전체 목록 조회
export const getAllNotices = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// 공지사항 상세 조회
export const getNoticeById = async (noticeNo) => {
  const response = await axios.get(`${API_URL}/${noticeNo}`);
  return response.data;
};

// 공지사항 작성
export const createNotice = async (noticeData) => {
  const response = await axios.post(API_URL, noticeData);
  return response.data;
};

// 공지사항 수정
export const updateNotice = async (noticeNo, noticeData) => {
  const response = await axios.put(`${API_URL}/${noticeNo}`, noticeData);
  return response.data;
};

// 공지사항 삭제
export const deleteNotice = async (noticeNo) => {
  await axios.delete(`${API_URL}/${noticeNo}`);
};

// 공지사항 검색
export const searchNotices = async (keyword) => {
  const response = await axios.get(`${API_URL}/search`, {
    params: { keyword }
  });
  return response.data;
};