import axios from "axios";


// 기본 API 경로. Vite 프록시를 통해 8080으로 전달됩니다.
const BASE_PREFIX = '/api';

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

// 로그인 처리
export const Userlogin = async(loginParam) => {
    const loginPrefix = `${BASE_PREFIX}/users`;

    const params = new URLSearchParams();
    params.append("username", loginParam.username);
    params.append("password", loginParam.password);
    
    const response = await axios.post(`${loginPrefix}/login`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

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

