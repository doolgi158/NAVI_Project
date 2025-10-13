import axios from "axios";

export const API_SERVER_HOST = "http://localhost:8080";
const BASE_PREFIX = `${API_SERVER_HOST}/api`;

// ✅ 공통 axios 인스턴스
const api = axios.create({
  baseURL: "/api",
});

// ✅ JWT 자동 첨부 + 로깅
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
  }
  return config;
});

// ✅ 토큰 만료 자동 처리
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("🔒 Token expired — clearing localStorage");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    return Promise.reject(err);
  }
);

// -------------------------------------------------------------------
// ✅ 공통 API 함수들
// -------------------------------------------------------------------

/** 단일 조회 */
export const getOne = async (domain, id) => {
  const prefix = `/${domain}`;
  const res = await api.get(`${prefix}/${id}`);
  return res.data;
};

/** 목록 조회 (페이징) */
export const getList = async (domain, pageParam) => {
  const { page, size } = pageParam;
  const prefix = `/${domain}`;
  const res = await api.get(`${prefix}`, { params: { page, size } });
  return res.data;
};

/** 항공편 검색 */
export const searchFlights = async (flightParam) => {
  const res = await api.post(`/flight/detail`, flightParam, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

/** 소셜 로그인 */
export const socialLogin = async (provider, code) => {
  const res = await api.get(`/auth/oauth/${provider}?code=${code}`);
  return res.data;
};

/** 카카오맵 설정 조회 */
export const getKakaoMapConfig = async () => {
  const res = await api.get(`/config/kakao`);
  return res.data;
};

/** 회원가입 */
export const signup = async (userData) => {
  const res = await api.post(`/users/signup`, userData, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export default api;
