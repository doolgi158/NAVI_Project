import axios from 'axios';

// API 기본 경로
const API_BASE_URL = 'http://localhost:8080/travel'; 

/**
 * 여행지 목록 조회 (관리자 페이지용)
 * @param {number} page - 요청 페이지 번호 (0부터 시작)
 * @param {number} size - 페이지당 항목 수
 * @param {string} search - 검색어
 * @returns {Promise<Page<TravelListResponseDTO>>}
 */
export const fetchTravelList = (page, size, search = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    
    if (search) {
        params.append('search', search);
    }

    return axios.get(`${API_BASE_URL}?${params.toString()}`);
};


/**
 * 여행지 상세 정보 조회 
 * @param {number} travelId - 여행지 ID
 * @returns {Promise<TravelDetailResponseDTO>}
 */
export const fetchTravelDetail = (travelId) => {
    return axios.get(`${API_BASE_URL}/${travelId}`);
};

/**
 * 여행지 등록 또는 수정 요청 (POST /travel/admin)
 * @param {object} travelData - TravelRequestDTO 형태의 데이터
 * @returns {Promise<TravelListResponseDTO>}
 */
export const saveOrUpdateTravel = (travelData) => {
    return axios.post(`${API_BASE_URL}/admin`, travelData);
};

/**
 * 여행지 삭제 요청 (DELETE /travel/admin/{travelId})
 * @param {number} travelId - 여행지 ID
 * @returns {Promise<void>}
 */
export const deleteTravel = (travelId) => {
    return axios.delete(`${API_BASE_URL}/admin/${travelId}`);
};