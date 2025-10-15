import axios from 'axios';

/**
 * ✅ 관리자용 여행지 목록 조회
 * @param {number} page - 현재 페이지 (0부터 시작)
 * @param {number} size - 페이지당 항목 수
 * @param {string} search - 검색어 (옵션)
 */
export const fetchAdminTravelList = async (page = 0, size = 10, search = '') => {
  const token = localStorage.getItem('accessToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { page, size, search },
  };

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

  const response = await axios.patch('/api/adm/travel/state', { ids, state: newState }, config);
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

  const response = await axios.get(`/api/adm/travel/detail/${travelId}`, config);
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

  const response = await axios.post('/api/adm/travel', travelData, config);
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

  const response = await axios.delete(`/api/adm/travel/${travelId}`, config);
  return response;
};
