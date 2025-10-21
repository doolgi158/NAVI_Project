import axios from "axios";
import { createBrowserHistory } from "history";

/* ===========================================================
   ✅ 기본 설정
=========================================================== */
export const API_SERVER_HOST = "http://localhost:8080";
const history = createBrowserHistory();

// ✅ Axios 인스턴스 생성
const api = axios.create({
  baseURL: `${API_SERVER_HOST}/api`,
  withCredentials: true,
});

/* ===========================================================
   ✅ 토큰 관리
=========================================================== */
let accessToken = localStorage.getItem("accessToken");
let refreshToken = localStorage.getItem("refreshToken");

if (accessToken) {
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

// ✅ 토큰 저장 및 갱신 함수
export const setAuthTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
  api.defaults.headers.common.Authorization = `Bearer ${access}`;
};

// ✅ JWT 디코드 함수
export const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/* ===========================================================
   ✅ 요청 인터셉터 (AccessToken 자동 첨부)
=========================================================== */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ===========================================================
   ✅ 응답 인터셉터 (401 자동 Refresh)
=========================================================== */
let isRefreshing = false;
let refreshSubscribers = [];

function onAccessTokenFetched(newAccessToken) {
  refreshSubscribers.forEach((cb) => cb(newAccessToken));
  refreshSubscribers = [];
}

function addSubscriber(cb) {
  refreshSubscribers.push(cb);
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isRefreshCall = originalRequest?.url?.includes("/users/refresh");

    // 🔒 Refresh 요청 자체는 무시
    if (isRefreshCall) {
      return Promise.reject(error);
    }

    // 🔑 AccessToken 만료 시
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 refresh 중이면 큐에 등록
        return new Promise((resolve) => {
          addSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const rt = localStorage.getItem("refreshToken");
        if (!rt) throw new Error("RefreshToken이 없습니다.");

        // ✅ Refresh API 호출
        const res = await axios.post(
          `${API_SERVER_HOST}/api/users/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${rt}` },
            withCredentials: true,
          }
        );

        const newAccessToken = res.data.accessToken;
        if (!newAccessToken) throw new Error("새 AccessToken이 없습니다.");

        // ✅ 토큰 갱신
        setAuthTokens(newAccessToken, rt);
        isRefreshing = false;
        onAccessTokenFetched(newAccessToken);

        // ✅ 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ 토큰 갱신 실패:", refreshError);
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        history.push("/");
        return Promise.reject(refreshError);
      }
    }

    // ⚠️ 기타 에러
    return Promise.reject(error);
  }
);

/* ===========================================================
   ✅ 공통 API 유틸 함수
=========================================================== */

/** 단일 조회 */
export const getOne = async (domain, id) => {
  const res = await api.get(`/${domain}/${id}`);
  return res.data;
};

/** 목록 조회 (페이징) */
export const getList = async (domain, pageParam = { page: 0, size: 10 }) => {
  const { page, size } = pageParam;
  const res = await api.get(`/${domain}`, { params: { page, size } });
  return res.data;
};

/** 항공편 검색 */
export const searchFlights = async (params) => {
  const res = await api.post(`/flight/detail`, params);
  return res.data;
};

/** 회원가입 */
export const signup = async (data) => {
  const res = await api.post(`/users/signup`, data);
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

/* ===========================================================
   ✅ 기본 export
=========================================================== */
export default api;