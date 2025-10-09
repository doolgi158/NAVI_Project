import axios from "axios";

export const API_SERVER_HOST = "http://localhost:8080"; // API 서버 호스트 주소

// 기본 API 경로. 도메인(travel, flight)이 이 뒤에 붙게 됩니다.
const BASE_PREFIX = `${API_SERVER_HOST}/api`;

/**
 * 특정 도메인의 단일 항목을 조회하는 일반화된 함수
 * @param {string} domain - 'travel' 또는 'flight' 등 도메인 이름
 * @param {string|number} id - 조회할 항목의 고유 ID (예: tno, fno 등)
 * @returns {Promise<any>} 항목 데이터
 */
export const getOne = async (domain, id) => {
    const prefix = `${BASE_PREFIX}/${domain}`;

    // HTTP GET 요청
    const response = await axios.get(`${prefix}/${id}`);
    
    // 성공적으로 응답을 받으면 데이터를 반환
    return response.data;
};

/**
 * 특정 도메인의 목록을 페이징하여 조회하는 일반화된 함수
 * @param {string} domain - 'travel' 또는 'flight' 등 도메인 이름
 * @param {object} pageParam - {page: number, size: number} 페이징 정보
 * @returns {Promise<any>} 페이징된 목록 데이터
 */
export const getList = async (domain, pageParam) => {
    const { page, size } = pageParam;
    
    const prefix = `${BASE_PREFIX}/${domain}`; 

    const response = await axios.get(
        `${prefix}`, 
        {params: {page: page, size: size}}
    );
    return response.data;
};

// 항공편 검색
export const searchFlights = async (flightParam) => {
  const url = `${API_SERVER_HOST}/flight/detail`;
  const response = await axios.post(url, flightParam, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

// 카카오맵 설정 정보를 서버에서 조회하는 함수

export const getKakaoMapConfig = async () => {
    // 💡 [수정] 프록시 설정에 따라 BASE_PREFIX를 사용하거나,
    // 클라이언트 코드가 BASE_PREFIX 없이 /api/config/kakao를 호출하도록 수정합니다.
    const response = await axios.get(`${BASE_PREFIX}/config/kakao`);
    return response.data;
};