import axios from 'axios';
import api from './naviApi';

/**
 * ✅ 관리자용 여행지 목록 조회
 * @param {number} page - 현재 페이지 (0부터 시작)
 * @param {number} size - 페이지당 항목 수
 * @param {string} search - 검색어 (옵션)
 * @param {string} sortField - 정렬 기준 필드명 (예: travelId, title, contentId, region2, state, views, likeCount, createdAt, updatedAt)
 * @param {('ascend'|'descend')} sortOrder - 정렬 방향
 */
export const fetchAdminTravelList = async (
  page = 0,
  size = 10,
  search = '',
  sortField = 'createdAt',
  sortOrder = 'descend'
) => {
  const token = localStorage.getItem('accessToken');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // ✅ 정렬 파라미터 추가 (백엔드에서 미사용 시 무시됨)
    params: { page, size, search, sortField, sortOrder },
  };

  // ✅ 기존 엔드포인트 그대로 유지
  const response = await axios.get('/api/adm/travel', config);
  return response;
};

/**
 * ✅ 공개상태 일괄 변경
 * @param {number[]} ids - 선택된 travelId 배열
 * @param {number} newState - 1(공개) or 0(비공개)
 */
export const updateAdminTravelState = async (ids, newState) => {
  const token = localStorage.getItem('accessToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  // ✅ 기존 PATCH, 기존 엔드포인트 유지
  const response = await api.patch('/adm/travel/state', { ids, state: newState }, config);
  return response;
};

/**
 * ✅ 관리자용 여행지 상세 조회
 * @param {number} travelId
 */
export const fetchAdminTravelDetail = async (travelId) => {
  const token = localStorage.getItem('accessToken');
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // ✅ 기존 엔드포인트 유지
  const response = await api.get(`/adm/travel/detail/${travelId}`, config);
  return response;
};

/**
 * ✅ 관리자용 여행지 등록/수정
 * @param {object} travelData
 */
export const saveAdminTravel = async (travelData) => {
  const token = localStorage.getItem('accessToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  // ✅ 기존 엔드포인트 유지
  const response = await api.post('/adm/travel', travelData, config);
  return response;
};

/**
 * ✅ 관리자용 여행지 삭제
 * @param {number} travelId
 */
export const deleteAdminTravel = async (travelId) => {
  const token = localStorage.getItem('accessToken');
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // ✅ 기존 엔드포인트 유지
  const response = await api.delete(`/adm/travel/${travelId}`, config);
  return response;
};
